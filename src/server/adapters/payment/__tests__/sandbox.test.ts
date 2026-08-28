import { beforeEach, describe, expect, it } from 'vitest';
import { fromMajorUnits } from '@/core/money';
import { __markSucceeded, __resetSandbox, sandboxGateway } from '../sandbox';

const aed = (v: number) => fromMajorUnits(v, 'AED');

beforeEach(() => { __resetSandbox(); });

describe('Cổng thanh toán — chống trùng (idempotency)', () => {
  it('gọi hai lần cùng khoá chỉ tạo MỘT giao dịch', async () => {
    const input = { bookingId: 'b1', amount: aed(315), description: 'Safari', idempotencyKey: 'key-abc' };
    const first = await sandboxGateway.createIntent(input);
    const second = await sandboxGateway.createIntent(input);
    expect(second.id).toBe(first.id);
  });

  it('khoá khác nhau tạo giao dịch khác nhau', async () => {
    const a = await sandboxGateway.createIntent({ bookingId: 'b1', amount: aed(100), description: 'x', idempotencyKey: 'k1' });
    const b = await sandboxGateway.createIntent({ bookingId: 'b2', amount: aed(100), description: 'x', idempotencyKey: 'k2' });
    expect(a.id).not.toBe(b.id);
  });
});

describe('Hoàn tiền', () => {
  it('không hoàn quá số đã thu', async () => {
    const i = await sandboxGateway.createIntent({ bookingId: 'b1', amount: aed(300), description: 'x', idempotencyKey: 'k1' });
    await expect(
      sandboxGateway.refund({ paymentIntentId: i.id, amount: aed(400), idempotencyKey: 'r1' }),
    ).rejects.toThrow(/nhiều hơn số tiền còn lại/);
  });

  it('hoàn nhiều lần cộng dồn không vượt tổng', async () => {
    const i = await sandboxGateway.createIntent({ bookingId: 'b1', amount: aed(300), description: 'x', idempotencyKey: 'k1' });
    await sandboxGateway.refund({ paymentIntentId: i.id, amount: aed(200), idempotencyKey: 'r1' });
    await sandboxGateway.refund({ paymentIntentId: i.id, amount: aed(100), idempotencyKey: 'r2' });
    await expect(
      sandboxGateway.refund({ paymentIntentId: i.id, amount: aed(1), idempotencyKey: 'r3' }),
    ).rejects.toThrow(/nhiều hơn số tiền còn lại/);
  });

  it('giao dịch không tồn tại → báo lỗi', async () => {
    await expect(
      sandboxGateway.refund({ paymentIntentId: 'khong-co', amount: aed(1), idempotencyKey: 'r' }),
    ).rejects.toThrow(/Không tìm thấy giao dịch/);
  });
});

describe('Webhook', () => {
  it('chữ ký sai bị TỪ CHỐI', async () => {
    await expect(sandboxGateway.verifyWebhook('{}', 'chu-ky-gia-mao')).rejects.toThrow(/Chữ ký webhook không hợp lệ/);
  });

  it('chữ ký đúng thì đọc được sự kiện', async () => {
    const evt = await sandboxGateway.verifyWebhook(
      JSON.stringify({ id: 'evt_1', type: 'payment_intent.succeeded', payment_intent: 'pi_1' }),
      'sandbox-signature',
    );
    expect(evt.id).toBe('evt_1');
    expect(evt.paymentIntentId).toBe('pi_1');
  });
});

describe('Trạng thái giao dịch', () => {
  it('mới tạo thì chờ khách thao tác, chưa phải đã trả', async () => {
    const i = await sandboxGateway.createIntent({ bookingId: 'b1', amount: aed(100), description: 'x', idempotencyKey: 'k1' });
    expect(i.status).toBe('requires_action');
  });

  it('sau khi khách trả thì chuyển succeeded', async () => {
    const i = await sandboxGateway.createIntent({ bookingId: 'b1', amount: aed(100), description: 'x', idempotencyKey: 'k1' });
    __markSucceeded(i.id);
    expect((await sandboxGateway.getIntent(i.id))?.status).toBe('succeeded');
  });

  it('adapter tự khai báo là sandbox để UI cảnh báo', () => {
    expect(sandboxGateway.isSandbox).toBe(true);
  });
});
