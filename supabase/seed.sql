-- ============================================================================
-- DubaiWay — DỮ LIỆU MẪU
-- ============================================================================
-- Dữ liệu thật về dịch vụ tại Dubai để chạy thử toàn bộ luồng.
-- KHÔNG chứa giấy tờ, số tài khoản hay thông tin cá nhân thật của bất kỳ ai.
-- Mọi email dùng đuôi .test (RFC 6761 — không bao giờ phân giải ra Internet).
--
-- LƯU Ý: public.users.id phải trùng với auth.users.id. Khi chạy trên Supabase,
-- tạo tài khoản demo trước rồi thay UUID bên dưới, hoặc dùng
-- `supabase db reset` ở môi trường local nơi seed chạy sau migration.
-- ============================================================================

-- ─── NGƯỜI DÙNG ─────────────────────────────────────────────────────────────
insert into public.users (id, email, phone, email_verified_at) values
  ('a0000000-0000-4000-8000-000000000001','admin@dubaiway.test',    '+971500000001', now()),
  ('a0000000-0000-4000-8000-000000000002','finance@dubaiway.test',  '+971500000002', now()),
  ('a0000000-0000-4000-8000-000000000003','reviewer@dubaiway.test', '+971500000003', now()),
  ('b0000000-0000-4000-8000-000000000001','desertrose@example.test','+971500000011', now()),
  ('b0000000-0000-4000-8000-000000000002','omar.guide@example.test','+971500000012', now()),
  ('c0000000-0000-4000-8000-000000000001','linh@example.test',      '+84900000001',  now()),
  ('c0000000-0000-4000-8000-000000000002','minh@example.test',      '+84900000002',  now()),
  ('c0000000-0000-4000-8000-000000000003','sarah@example.test',     '+971500000021', now())
on conflict (id) do nothing;

insert into public.profiles (user_id, full_name, locale, currency, country) values
  ('a0000000-0000-4000-8000-000000000001','DubaiWay Admin','en','USD','AE'),
  ('a0000000-0000-4000-8000-000000000002','DubaiWay Finance','en','USD','AE'),
  ('a0000000-0000-4000-8000-000000000003','DubaiWay Reviewer','en','USD','AE'),
  ('b0000000-0000-4000-8000-000000000001','Ahmed Al Mansouri','en','USD','AE'),
  ('b0000000-0000-4000-8000-000000000002','Omar Haddad','en','USD','AE'),
  ('c0000000-0000-4000-8000-000000000001','Nguyễn Thuỳ Linh','vi','VND','VN'),
  ('c0000000-0000-4000-8000-000000000002','Trần Quang Minh','vi','VND','VN'),
  ('c0000000-0000-4000-8000-000000000003','Sarah Whitfield','en','USD','GB')
on conflict (user_id) do nothing;

insert into public.user_roles (user_id, role_key) values
  ('a0000000-0000-4000-8000-000000000001','super_admin'),
  ('a0000000-0000-4000-8000-000000000002','finance'),
  ('a0000000-0000-4000-8000-000000000003','merchant_reviewer'),
  ('a0000000-0000-4000-8000-000000000003','service_reviewer')
on conflict do nothing;

-- ─── DANH MỤC ───────────────────────────────────────────────────────────────
insert into public.categories (id, slug, sort_order) values
  ('d0000000-0000-4000-8000-000000000001','day-tours',        1),
  ('d0000000-0000-4000-8000-000000000002','multi-day-tours',  2),
  ('d0000000-0000-4000-8000-000000000003','dubai-uae-tours',  3),
  ('d0000000-0000-4000-8000-000000000004','pilgrimage-tours', 4),
  ('d0000000-0000-4000-8000-000000000005','hotels-apartments',5),
  ('d0000000-0000-4000-8000-000000000006','attraction-tickets',6),
  ('d0000000-0000-4000-8000-000000000007','event-tickets',    7),
  ('d0000000-0000-4000-8000-000000000008','theme-parks',      8),
  ('d0000000-0000-4000-8000-000000000009','desert-safari',    9),
  ('d0000000-0000-4000-8000-000000000010','yacht-cruise',    10),
  ('d0000000-0000-4000-8000-000000000011','dining-vouchers', 11),
  ('d0000000-0000-4000-8000-000000000012','airport-transfer',12),
  ('d0000000-0000-4000-8000-000000000013','car-rental',      13),
  ('d0000000-0000-4000-8000-000000000014','tour-guides',     14),
  ('d0000000-0000-4000-8000-000000000015','visa',            15),
  ('d0000000-0000-4000-8000-000000000016','flights',         16),
  ('d0000000-0000-4000-8000-000000000017','travel-insurance',17),
  ('d0000000-0000-4000-8000-000000000018','sim-esim',        18),
  ('d0000000-0000-4000-8000-000000000019','photography',     19),
  ('d0000000-0000-4000-8000-000000000020','other-services',  20)
on conflict (slug) do nothing;

insert into public.category_translations (category_id, locale, name) values
  ('d0000000-0000-4000-8000-000000000001','vi','Tour trong ngày'),
  ('d0000000-0000-4000-8000-000000000001','en','Day Tours'),
  ('d0000000-0000-4000-8000-000000000002','vi','Tour nhiều ngày'),
  ('d0000000-0000-4000-8000-000000000002','en','Multi-day Tours'),
  ('d0000000-0000-4000-8000-000000000003','vi','Tour Dubai & UAE'),
  ('d0000000-0000-4000-8000-000000000003','en','Dubai & UAE Tours'),
  ('d0000000-0000-4000-8000-000000000004','vi','Tour hành hương'),
  ('d0000000-0000-4000-8000-000000000004','en','Pilgrimage Tours'),
  ('d0000000-0000-4000-8000-000000000005','vi','Khách sạn & căn hộ'),
  ('d0000000-0000-4000-8000-000000000005','en','Hotels & Apartments'),
  ('d0000000-0000-4000-8000-000000000006','vi','Vé tham quan'),
  ('d0000000-0000-4000-8000-000000000006','en','Attraction Tickets'),
  ('d0000000-0000-4000-8000-000000000007','vi','Vé sự kiện'),
  ('d0000000-0000-4000-8000-000000000007','en','Event Tickets'),
  ('d0000000-0000-4000-8000-000000000008','vi','Công viên giải trí'),
  ('d0000000-0000-4000-8000-000000000008','en','Theme Parks'),
  ('d0000000-0000-4000-8000-000000000009','vi','Safari sa mạc'),
  ('d0000000-0000-4000-8000-000000000009','en','Desert Safari'),
  ('d0000000-0000-4000-8000-000000000010','vi','Du thuyền & yacht'),
  ('d0000000-0000-4000-8000-000000000010','en','Yacht & Cruise'),
  ('d0000000-0000-4000-8000-000000000011','vi','Nhà hàng & voucher ăn uống'),
  ('d0000000-0000-4000-8000-000000000011','en','Dining & Restaurant Vouchers'),
  ('d0000000-0000-4000-8000-000000000012','vi','Đưa đón sân bay'),
  ('d0000000-0000-4000-8000-000000000012','en','Airport Transfer'),
  ('d0000000-0000-4000-8000-000000000013','vi','Thuê xe'),
  ('d0000000-0000-4000-8000-000000000013','en','Car Rental'),
  ('d0000000-0000-4000-8000-000000000014','vi','Hướng dẫn viên'),
  ('d0000000-0000-4000-8000-000000000014','en','Tour Guides'),
  ('d0000000-0000-4000-8000-000000000015','vi','Visa'),
  ('d0000000-0000-4000-8000-000000000015','en','Visa'),
  ('d0000000-0000-4000-8000-000000000016','vi','Vé máy bay'),
  ('d0000000-0000-4000-8000-000000000016','en','Flights'),
  ('d0000000-0000-4000-8000-000000000017','vi','Bảo hiểm du lịch'),
  ('d0000000-0000-4000-8000-000000000017','en','Travel Insurance'),
  ('d0000000-0000-4000-8000-000000000018','vi','SIM & eSIM'),
  ('d0000000-0000-4000-8000-000000000018','en','SIM & eSIM'),
  ('d0000000-0000-4000-8000-000000000019','vi','Chụp ảnh & quay phim'),
  ('d0000000-0000-4000-8000-000000000019','en','Photography & Videography'),
  ('d0000000-0000-4000-8000-000000000020','vi','Dịch vụ du lịch khác'),
  ('d0000000-0000-4000-8000-000000000020','en','Other Travel Services')
on conflict do nothing;

-- ─── MERCHANT ───────────────────────────────────────────────────────────────
-- 1. Doanh nghiệp đã duyệt
insert into public.merchants (
  id, kind, status, slug, legal_name, trading_name, registration_country,
  registration_number, tax_number, address_line1, city, country,
  contact_email, contact_phone, website_url, description,
  legal_rep_name, legal_rep_position, owner_user_id, submitted_at, approved_at
) values (
  'e0000000-0000-4000-8000-000000000001','business','approved','desert-rose-tourism',
  'Desert Rose Tourism LLC','Desert Rose Dubai','AE',
  'CN-1234567','100234567800003','Office 1204, Business Bay Tower','Dubai','AE',
  'booking@desertrose.example.test','+971500000011','https://desertrose.example.test',
  'Đơn vị lữ hành nội địa tại Dubai từ 2015, chuyên safari sa mạc, city tour và du thuyền Marina.',
  'Ahmed Al Mansouri','Giám đốc điều hành','b0000000-0000-4000-8000-000000000001',
  now() - interval '40 days', now() - interval '35 days'
) on conflict (id) do nothing;

-- 2. Cá nhân đang chờ duyệt — để thử luồng xét duyệt
insert into public.merchants (
  id, kind, status, slug, individual_full_name, individual_dob, individual_nationality,
  address_line1, city, country, contact_email, contact_phone,
  experience_summary, owner_user_id, submitted_at
) values (
  'e0000000-0000-4000-8000-000000000002','individual','under_review','omar-private-guide',
  'Omar Haddad','1988-04-12','JO',
  'Al Barsha 1','Dubai','AE','omar.guide@example.test','+971500000012',
  'Hướng dẫn viên tự do 8 năm tại Dubai, nói tiếng Anh, Ả Rập và tiếng Việt cơ bản.',
  'b0000000-0000-4000-8000-000000000002', now() - interval '3 days'
) on conflict (id) do nothing;

insert into public.merchant_bank_accounts (merchant_id, account_holder, bank_name, bank_country, iban, account_number_last4, swift_bic, currency, verified_at)
values ('e0000000-0000-4000-8000-000000000001','Desert Rose Tourism LLC','Emirates NBD','AE',
        'AE070331234567890123456','3456','EBILAEAD','USD', now() - interval '30 days')
on conflict do nothing;

insert into public.merchant_review_history (merchant_id, from_status, to_status, reviewer_id, reason) values
  ('e0000000-0000-4000-8000-000000000001','submitted','under_review','a0000000-0000-4000-8000-000000000003','Bắt đầu thẩm định hồ sơ'),
  ('e0000000-0000-4000-8000-000000000001','under_review','approved','a0000000-0000-4000-8000-000000000003','Giấy phép lữ hành DTCM hợp lệ, tài khoản ngân hàng khớp tên pháp nhân'),
  ('e0000000-0000-4000-8000-000000000002','submitted','under_review','a0000000-0000-4000-8000-000000000003','Chờ bổ sung giấy phép hành nghề hướng dẫn viên')
on conflict do nothing;

-- ─── DỊCH VỤ ────────────────────────────────────────────────────────────────
insert into public.services (
  id, merchant_id, category_id, slug, status, city, address, latitude, longitude,
  meeting_point, pickup_available, duration_minutes, languages, min_guests, max_guests,
  instant_confirmation, free_cancellation, booking_cutoff_hours,
  price_from_minor, currency, is_featured, published_at, approved_at
) values
  ('f0000000-0000-4000-8000-000000000001','e0000000-0000-4000-8000-000000000001','d0000000-0000-4000-8000-000000000009',
   'evening-desert-safari-bbq','active','Dubai','Lehbab Desert Conservation Area',24.827100,55.503200,
   'Đón tại khách sạn trong khu Dubai Marina / Downtown / Deira',true,360,'{en,ar,vi}',1,40,
   true,true,12, 15000,'USD',true, now() - interval '30 days', now() - interval '30 days'),

  ('f0000000-0000-4000-8000-000000000002','e0000000-0000-4000-8000-000000000001','d0000000-0000-4000-8000-000000000006',
   'burj-khalifa-124-125-floor','active','Dubai','1 Sheikh Mohammed bin Rashid Blvd',25.197197,55.274376,
   'Quầy At The Top, tầng hầm Dubai Mall',false,90,'{en,ar,vi}',1,10,
   true,false,24, 17900,'USD',true, now() - interval '28 days', now() - interval '28 days'),

  ('f0000000-0000-4000-8000-000000000003','e0000000-0000-4000-8000-000000000001','d0000000-0000-4000-8000-000000000010',
   'dubai-marina-luxury-yacht','active','Dubai','Dubai Marina Yacht Club',25.080600,55.140300,
   'Bến số 3, Dubai Marina Yacht Club',false,120,'{en,ar}',2,12,
   false,true,48, 45000,'USD',true, now() - interval '25 days', now() - interval '25 days'),

  ('f0000000-0000-4000-8000-000000000004','e0000000-0000-4000-8000-000000000001','d0000000-0000-4000-8000-000000000012',
   'dxb-airport-transfer-private','active','Dubai','Dubai International Airport',25.252800,55.364400,
   'Sảnh đến, nhân viên cầm bảng tên khách',true,60,'{en,ar,vi}',1,6,
   true,true,6, 12000,'USD',false, now() - interval '20 days', now() - interval '20 days'),

  ('f0000000-0000-4000-8000-000000000005','e0000000-0000-4000-8000-000000000001','d0000000-0000-4000-8000-000000000001',
   'abu-dhabi-full-day-tour','active','Dubai','Khởi hành từ Dubai',25.204800,55.270800,
   'Đón tại khách sạn ở Dubai',true,600,'{en,ar,vi}',2,25,
   false,true,24, 28000,'USD',true, now() - interval '18 days', now() - interval '18 days'),

  ('f0000000-0000-4000-8000-000000000006','e0000000-0000-4000-8000-000000000001','d0000000-0000-4000-8000-000000000011',
   'pierchic-seafood-dinner-voucher','active','Dubai','Al Qasr, Madinat Jumeirah',25.132600,55.184600,
   'Nhà hàng Pierchic, quầy lễ tân',false,120,'{en}',1,8,
   true,false,24, 39000,'USD',false, now() - interval '15 days', now() - interval '15 days')
on conflict (id) do nothing;

insert into public.service_translations (service_id, locale, title, summary, description, highlights, included, excluded) values
  ('f0000000-0000-4000-8000-000000000001','vi','Safari sa mạc buổi chiều kèm tiệc BBQ',
   'Lái xe cồn cát, cưỡi lạc đà, xem hoàng hôn và bữa tối BBQ trong trại sa mạc Bedouin.',
   'Xe 4x4 đón bạn tại khách sạn vào đầu giờ chiều, chạy khoảng 45 phút tới khu bảo tồn sa mạc Lehbab. Chương trình gồm 20 phút lái xe cồn cát, dừng chụp ảnh hoàng hôn, cưỡi lạc đà ngắn, vẽ henna, hút shisha và bữa tối BBQ buffet có món chay. Kết thúc bằng màn múa Tanoura và trình diễn lửa. Về tới khách sạn khoảng 21:30.',
   '{"Lái xe cồn cát 20 phút với tài xế có chứng chỉ","Ngắm hoàng hôn giữa cồn cát đỏ","Bữa tối BBQ buffet có món chay và halal","Múa Tanoura và trình diễn lửa","Đón trả tận khách sạn"}',
   '{"Đón và trả tại khách sạn","Nước uống không giới hạn","Bữa tối BBQ buffet","Cưỡi lạc đà","Vẽ henna","Bảo hiểm du lịch cơ bản"}',
   '{"Đồ uống có cồn","Quad bike (phụ phí 150 USD)","Tiền tip cho tài xế"}'),
  ('f0000000-0000-4000-8000-000000000001','en','Evening Desert Safari with BBQ Dinner',
   'Dune bashing, camel ride, sunset photos and a BBQ dinner at a Bedouin camp.',
   'A 4x4 collects you from your hotel in the early afternoon for the 45-minute drive to the Lehbab desert conservation area. The programme includes 20 minutes of dune bashing, a sunset photo stop, a short camel ride, henna painting, shisha and a BBQ buffet dinner with vegetarian options. The evening closes with Tanoura dance and a fire show. You are back at your hotel around 21:30.',
   '{"20 minutes of dune bashing with a certified driver","Sunset over the red dunes","BBQ buffet dinner with vegetarian and halal options","Tanoura dance and fire show","Hotel pickup and drop-off"}',
   '{"Hotel pickup and drop-off","Unlimited soft drinks","BBQ buffet dinner","Camel ride","Henna painting","Basic travel insurance"}',
   '{"Alcoholic beverages","Quad bike (150 USD supplement)","Driver gratuities"}'),

  ('f0000000-0000-4000-8000-000000000002','vi','Vé Burj Khalifa tầng 124 & 125',
   'Lên đài quan sát toà nhà cao nhất thế giới, vào cửa không xếp hàng.',
   'Vé vào cửa tầng 124 và 125 của Burj Khalifa. Thang máy tốc độ cao đưa bạn lên độ cao 452 m trong khoảng 1 phút. Đài quan sát ngoài trời ở tầng 124 nhìn toàn cảnh Dubai, Vịnh Ba Tư và sa mạc. Khung giờ hoàng hôn kín chỗ rất sớm, nên đặt trước ít nhất 3 ngày.',
   '{"Vào cửa không xếp hàng","Đài quan sát ngoài trời tầng 124","Kính viễn vọng thực tế tăng cường","Ảnh kỷ niệm chuyên nghiệp"}',
   '{"Vé vào cửa tầng 124 và 125","Hướng dẫn đa ngôn ngữ qua ứng dụng"}',
   '{"Đưa đón","Đồ ăn thức uống","Vé tầng 148 (gói riêng)"}'),
  ('f0000000-0000-4000-8000-000000000002','en','Burj Khalifa Level 124 & 125 Ticket',
   'Skip-the-line access to the observation decks of the world''s tallest building.',
   'Admission to levels 124 and 125 of the Burj Khalifa. A high-speed lift takes you to 452 m in about a minute. The outdoor terrace on level 124 looks out over Dubai, the Arabian Gulf and the desert. Sunset slots sell out well in advance — book at least three days ahead.',
   '{"Skip-the-line entry","Outdoor observation terrace on level 124","Augmented-reality telescopes","Professional souvenir photo"}',
   '{"Admission to levels 124 and 125","Multilingual guide via app"}',
   '{"Transfers","Food and drink","Level 148 access (separate package)"}'),

  ('f0000000-0000-4000-8000-000000000003','vi','Thuê du thuyền riêng Dubai Marina 2 giờ',
   'Du thuyền riêng cho nhóm tới 12 khách, đi qua Marina, JBR và Ain Dubai.',
   'Du thuyền dài 48 feet có khoang lạnh, sân tắm nắng và nhà vệ sinh. Hải trình 2 giờ đi qua Dubai Marina, bãi biển JBR, Bluewaters Island và Ain Dubai, có dừng để bơi và chụp ảnh. Thuyền trưởng và thuỷ thủ đoàn đi kèm. Khách được mang đồ ăn thức uống riêng.',
   '{"Du thuyền riêng, không ghép khách","Thuyền trưởng và thuỷ thủ đoàn có bằng","Dừng bơi giữa hải trình","Được mang đồ ăn thức uống riêng"}',
   '{"Du thuyền riêng 2 giờ","Thuyền trưởng và thuỷ thủ đoàn","Nước suối và đá","Áo phao và thiết bị an toàn"}',
   '{"Đồ ăn và đồ uống","Đưa đón","Thiết bị câu cá (phụ phí)"}'),
  ('f0000000-0000-4000-8000-000000000003','en','Private Dubai Marina Yacht Charter — 2 Hours',
   'A private yacht for up to 12 guests along the Marina, JBR and Ain Dubai.',
   'A 48-foot yacht with an air-conditioned cabin, sun deck and bathroom. The two-hour route passes Dubai Marina, JBR beach, Bluewaters Island and Ain Dubai, with a stop for swimming and photos. Captain and crew included. You are welcome to bring your own food and drinks.',
   '{"Private charter, no shared groups","Licensed captain and crew","Mid-route swimming stop","Bring your own food and drinks"}',
   '{"Two-hour private charter","Captain and crew","Bottled water and ice","Life jackets and safety equipment"}',
   '{"Food and beverages","Transfers","Fishing equipment (surcharge)"}'),

  ('f0000000-0000-4000-8000-000000000004','vi','Đưa đón sân bay Dubai (DXB) xe riêng',
   'Tài xế đón tận sảnh đến, theo dõi chuyến bay, xe riêng không ghép khách.',
   'Dịch vụ đưa đón một chiều giữa sân bay quốc tế Dubai và khách sạn trong nội thành. Tài xế theo dõi số hiệu chuyến bay nên chuyến trễ vẫn được đón. Thời gian chờ miễn phí 60 phút với chuyến quốc tế. Xe Lexus ES hoặc tương đương, tối đa 3 khách và 3 vali; có xe 6 chỗ cho nhóm đông hơn.',
   '{"Theo dõi chuyến bay, trễ vẫn đón","Chờ miễn phí 60 phút","Xe riêng, không ghép khách","Ghế trẻ em miễn phí khi yêu cầu trước"}',
   '{"Đón tận sảnh đến có bảng tên","Toàn bộ phí cầu đường và đỗ xe","Nước suối","Wi-Fi trên xe"}',
   '{"Tiền tip","Phí chờ quá 60 phút","Ghế trẻ em nếu không báo trước"}'),
  ('f0000000-0000-4000-8000-000000000004','en','Dubai Airport (DXB) Private Transfer',
   'Meet-and-greet at arrivals, flight tracking, private vehicle.',
   'One-way private transfer between Dubai International Airport and your hotel in the city. Your driver tracks your flight number, so delays are covered. Sixty minutes of free waiting time on international arrivals. Lexus ES or similar for up to 3 passengers and 3 suitcases; a 6-seater is available for larger groups.',
   '{"Flight tracking — delays covered","60 minutes free waiting time","Private vehicle, no sharing","Free child seat on request"}',
   '{"Meet and greet at arrivals with name board","All tolls and parking","Bottled water","On-board Wi-Fi"}',
   '{"Gratuities","Waiting beyond 60 minutes","Child seat if not requested in advance"}'),

  ('f0000000-0000-4000-8000-000000000005','vi','Tour Abu Dhabi trọn ngày từ Dubai',
   'Thánh đường Sheikh Zayed, Qasr Al Watan và bến Corniche trong một ngày.',
   'Khởi hành từ Dubai lúc 08:00, đi khoảng 90 phút tới Abu Dhabi. Tham quan Thánh đường Lớn Sheikh Zayed (có hướng dẫn về quy định trang phục), cung điện Qasr Al Watan, dừng chụp ảnh tại Emirates Palace và đi dọc bến Corniche. Ăn trưa buffet tại nhà hàng địa phương. Về tới Dubai khoảng 19:00.',
   '{"Thánh đường Lớn Sheikh Zayed","Cung điện Qasr Al Watan","Emirates Palace và bến Corniche","Hướng dẫn viên tiếng Việt theo yêu cầu"}',
   '{"Xe có điều hoà và đón tại khách sạn","Hướng dẫn viên","Vé vào Qasr Al Watan","Ăn trưa buffet","Nước suối"}',
   '{"Trang phục phù hợp thánh đường (có thể thuê tại chỗ)","Chi tiêu cá nhân","Tiền tip"}'),
  ('f0000000-0000-4000-8000-000000000005','en','Abu Dhabi Full-Day Tour from Dubai',
   'Sheikh Zayed Grand Mosque, Qasr Al Watan and the Corniche in one day.',
   'Departing Dubai at 08:00 for the 90-minute drive to Abu Dhabi. The day covers the Sheikh Zayed Grand Mosque (with a briefing on the dress code), the Qasr Al Watan palace, a photo stop at Emirates Palace and a drive along the Corniche. Buffet lunch at a local restaurant. Back in Dubai around 19:00.',
   '{"Sheikh Zayed Grand Mosque","Qasr Al Watan palace","Emirates Palace and the Corniche","Vietnamese-speaking guide on request"}',
   '{"Air-conditioned vehicle with hotel pickup","Guide","Qasr Al Watan admission","Buffet lunch","Bottled water"}',
   '{"Mosque-appropriate clothing (rental available on site)","Personal expenses","Gratuities"}'),

  ('f0000000-0000-4000-8000-000000000006','vi','Voucher hải sản Pierchic — set 3 món cho 2 người',
   'Nhà hàng hải sản trên cầu cảng nhìn ra Burj Al Arab.',
   'Set thực đơn 3 món cho hai người tại Pierchic, nhà hàng hải sản nằm cuối cầu gỗ vươn ra biển thuộc khu Madinat Jumeirah, nhìn thẳng Burj Al Arab. Bao gồm khai vị, món chính hải sản và tráng miệng. Voucher có giá trị 90 ngày, cần đặt bàn trước. Không áp dụng dịp lễ tết.',
   '{"Bàn nhìn ra Burj Al Arab","Set 3 món cho 2 người","Hải sản đánh bắt trong ngày","Có lựa chọn chay khi báo trước"}',
   '{"Khai vị, món chính, tráng miệng cho 2 người","Nước lọc"}',
   '{"Đồ uống có cồn","Phí phục vụ","Đưa đón"}'),
  ('f0000000-0000-4000-8000-000000000006','en','Pierchic Seafood Voucher — 3-Course Set for Two',
   'Pier-end seafood restaurant looking across to the Burj Al Arab.',
   'A three-course set menu for two at Pierchic, a seafood restaurant at the end of a wooden pier in the Madinat Jumeirah complex, facing the Burj Al Arab. Includes a starter, a seafood main and dessert. The voucher is valid for 90 days and requires a reservation. Not valid on public holidays.',
   '{"Table with Burj Al Arab views","Three courses for two","Daily seafood catch","Vegetarian option on request"}',
   '{"Starter, main and dessert for two","Still water"}',
   '{"Alcoholic beverages","Service charge","Transfers"}')
on conflict do nothing;

-- ─── GÓI DỊCH VỤ ────────────────────────────────────────────────────────────
insert into public.service_packages (id, service_id, code, price_adult_minor, price_child_minor, price_group_minor, group_size, currency, tax_rate_bps, min_guests, max_guests) values
  ('01000000-0000-4000-8000-000000000001','f0000000-0000-4000-8000-000000000001','standard', 15000,  9500, null, null,'USD',500,1,40),
  ('01000000-0000-4000-8000-000000000002','f0000000-0000-4000-8000-000000000001','vip',      29000, 19000, null, null,'USD',500,1,20),
  ('01000000-0000-4000-8000-000000000003','f0000000-0000-4000-8000-000000000002','standard', 17900, 14900, null, null,'USD',500,1,10),
  ('01000000-0000-4000-8000-000000000004','f0000000-0000-4000-8000-000000000002','sunset',   25900, 21900, null, null,'USD',500,1,10),
  ('01000000-0000-4000-8000-000000000005','f0000000-0000-4000-8000-000000000003','charter2h',    0,     0, 145000,   12,'USD',500,2,12),
  ('01000000-0000-4000-8000-000000000006','f0000000-0000-4000-8000-000000000004','sedan',        0,     0,  12000,    3,'USD',500,1,3),
  ('01000000-0000-4000-8000-000000000007','f0000000-0000-4000-8000-000000000004','van',          0,     0,  19000,    6,'USD',500,1,6),
  ('01000000-0000-4000-8000-000000000008','f0000000-0000-4000-8000-000000000005','join',     28000, 19000, null, null,'USD',500,2,25),
  ('01000000-0000-4000-8000-000000000009','f0000000-0000-4000-8000-000000000006','set3course',   0,     0,  39000,    2,'USD',500,1,8)
on conflict (id) do nothing;

insert into public.package_translations (package_id, locale, name, description) values
  ('01000000-0000-4000-8000-000000000001','vi','Tiêu chuẩn','Xe ghép tối đa 6 khách, ghế thường trong trại'),
  ('01000000-0000-4000-8000-000000000001','en','Standard','Shared 4x4 up to 6 guests, standard camp seating'),
  ('01000000-0000-4000-8000-000000000002','vi','VIP','Xe riêng, khu ngồi VIP có sofa và phục vụ riêng'),
  ('01000000-0000-4000-8000-000000000002','en','VIP','Private 4x4, VIP majlis seating with dedicated service'),
  ('01000000-0000-4000-8000-000000000003','vi','Giờ thường','Khung giờ ban ngày, không phải giờ hoàng hôn'),
  ('01000000-0000-4000-8000-000000000003','en','Non-Prime Hours','Daytime slots, excludes sunset'),
  ('01000000-0000-4000-8000-000000000004','vi','Giờ hoàng hôn','Khung giờ đẹp nhất, kín chỗ sớm'),
  ('01000000-0000-4000-8000-000000000004','en','Sunset Slot','The most popular window — books out early'),
  ('01000000-0000-4000-8000-000000000005','vi','Thuê nguyên thuyền 2 giờ','Trọn gói cho tối đa 12 khách'),
  ('01000000-0000-4000-8000-000000000005','en','2-Hour Private Charter','Flat rate for up to 12 guests'),
  ('01000000-0000-4000-8000-000000000006','vi','Xe 4 chỗ','Lexus ES hoặc tương đương, tối đa 3 khách'),
  ('01000000-0000-4000-8000-000000000006','en','Sedan','Lexus ES or similar, up to 3 passengers'),
  ('01000000-0000-4000-8000-000000000007','vi','Xe 7 chỗ','Toyota Previa hoặc tương đương, tối đa 6 khách'),
  ('01000000-0000-4000-8000-000000000007','en','Van','Toyota Previa or similar, up to 6 passengers'),
  ('01000000-0000-4000-8000-000000000008','vi','Tour ghép','Xe chung với khách khác, khởi hành hằng ngày'),
  ('01000000-0000-4000-8000-000000000008','en','Join-in Tour','Shared coach, daily departures'),
  ('01000000-0000-4000-8000-000000000009','vi','Set 3 món cho 2 người','Khai vị, món chính, tráng miệng'),
  ('01000000-0000-4000-8000-000000000009','en','3-Course Set for Two','Starter, main and dessert')
on conflict do nothing;

insert into public.service_policies (service_id, cancellation_text, cancellation_tiers, reschedule_allowed, reschedule_cutoff_hours, dispute_window_hours) values
  ('f0000000-0000-4000-8000-000000000001','Huỷ miễn phí trước 24 giờ. Trong 24 giờ hoàn 50%. Không hoàn nếu không có mặt.',
   '[{"hours_before":24,"refund_bps":10000},{"hours_before":4,"refund_bps":5000}]'::jsonb, true, 24, 72),
  ('f0000000-0000-4000-8000-000000000002','Vé đã xuất không hoàn, không đổi ngày.',
   '[]'::jsonb, false, null, 48),
  ('f0000000-0000-4000-8000-000000000003','Huỷ miễn phí trước 48 giờ. Thời tiết xấu được đổi lịch miễn phí.',
   '[{"hours_before":48,"refund_bps":10000},{"hours_before":24,"refund_bps":5000}]'::jsonb, true, 24, 72),
  ('f0000000-0000-4000-8000-000000000004','Huỷ miễn phí trước 6 giờ.',
   '[{"hours_before":6,"refund_bps":10000}]'::jsonb, true, 6, 48),
  ('f0000000-0000-4000-8000-000000000005','Huỷ miễn phí trước 24 giờ.',
   '[{"hours_before":24,"refund_bps":10000},{"hours_before":12,"refund_bps":5000}]'::jsonb, true, 24, 72),
  ('f0000000-0000-4000-8000-000000000006','Voucher không hoàn tiền sau khi phát hành, có thể chuyển nhượng.',
   '[]'::jsonb, false, null, 168)
on conflict do nothing;

-- Tồn kho 60 ngày tới cho các dịch vụ theo suất.
insert into public.service_availability (service_id, package_id, available_date, start_time, capacity_total, capacity_reserved)
select s.service_id, s.package_id, (current_date + n)::date, s.start_time, s.cap,
       floor(random() * (s.cap * 0.4))::int
from (values
  ('f0000000-0000-4000-8000-000000000001'::uuid,'01000000-0000-4000-8000-000000000001'::uuid,'15:00'::time,40),
  ('f0000000-0000-4000-8000-000000000001'::uuid,'01000000-0000-4000-8000-000000000002'::uuid,'15:00'::time,20),
  ('f0000000-0000-4000-8000-000000000002'::uuid,'01000000-0000-4000-8000-000000000003'::uuid,'10:00'::time,60),
  ('f0000000-0000-4000-8000-000000000002'::uuid,'01000000-0000-4000-8000-000000000004'::uuid,'17:30'::time,30),
  ('f0000000-0000-4000-8000-000000000003'::uuid,'01000000-0000-4000-8000-000000000005'::uuid,'16:00'::time,12),
  ('f0000000-0000-4000-8000-000000000005'::uuid,'01000000-0000-4000-8000-000000000008'::uuid,'08:00'::time,25)
) as s(service_id, package_id, start_time, cap)
cross join generate_series(1, 60) as n
on conflict do nothing;

-- ─── GIỚI THIỆU ─────────────────────────────────────────────────────────────
insert into public.referral_codes (user_id, code) values
  ('c0000000-0000-4000-8000-000000000001','LINH2K7X'),
  ('c0000000-0000-4000-8000-000000000002','MINH4RPQ'),
  ('c0000000-0000-4000-8000-000000000003','SARAH8YT')
on conflict do nothing;

-- Linh giới thiệu Minh. Minh giới thiệu Sarah.
-- Linh KHÔNG nhận thưởng từ giao dịch của Sarah — đó là ý nghĩa của "một tầng".
insert into public.referral_attributions (referred_user_id, referrer_user_id, referral_code_id)
select 'c0000000-0000-4000-8000-000000000002','c0000000-0000-4000-8000-000000000001', id
  from public.referral_codes where code = 'LINH2K7X'
on conflict do nothing;

insert into public.referral_attributions (referred_user_id, referrer_user_id, referral_code_id)
select 'c0000000-0000-4000-8000-000000000003','c0000000-0000-4000-8000-000000000002', id
  from public.referral_codes where code = 'MINH4RPQ'
on conflict do nothing;

insert into public.wallets (owner_type, user_id, currency) values
  ('user','c0000000-0000-4000-8000-000000000001','USD'),
  ('user','c0000000-0000-4000-8000-000000000002','USD')
on conflict do nothing;

insert into public.wallets (owner_type, merchant_id, currency) values
  ('merchant','e0000000-0000-4000-8000-000000000001','USD')
on conflict do nothing;

-- ─── ĐƠN HÀNG Ở NHIỀU TRẠNG THÁI ────────────────────────────────────────────
-- Đơn 1: Minh mua safari, Linh giới thiệu → ĐÃ HOÀN THÀNH, thưởng đã mở khoá.
-- 2 người lớn × 150 USD = 300 USD. Hoa hồng 30 USD. Merchant 270 USD. Linh 9 USD.
insert into public.bookings (
  id, reference, user_id, merchant_id, status, currency,
  subtotal_minor, discount_minor, tax_minor, fee_minor, customer_total_minor,
  commission_base_minor, commission_rate_bps, platform_commission_minor, merchant_revenue_minor,
  referrer_user_id, referral_share_bps, referral_reward_minor, platform_net_minor,
  completed_at, dispute_window_ends_at
) values (
  '02000000-0000-4000-8000-000000000001','DW-7K2M4P',
  'c0000000-0000-4000-8000-000000000002','e0000000-0000-4000-8000-000000000001','completed','USD',
  30000, 0, 1500, 0, 31500,
  30000, 1000, 3000, 27000,
  'c0000000-0000-4000-8000-000000000001', 3000, 900, 2100,
  now() - interval '10 days', now() - interval '7 days'
) on conflict (id) do nothing;

-- Đơn 2: Sarah mua Burj Khalifa, Minh giới thiệu → ĐÃ THANH TOÁN, chờ sử dụng.
-- Linh KHÔNG có mặt trong đơn này. Đó là bằng chứng một tầng.
insert into public.bookings (
  id, reference, user_id, merchant_id, status, currency,
  subtotal_minor, discount_minor, tax_minor, fee_minor, customer_total_minor,
  commission_base_minor, commission_rate_bps, platform_commission_minor, merchant_revenue_minor,
  referrer_user_id, referral_share_bps, referral_reward_minor, platform_net_minor
) values (
  '02000000-0000-4000-8000-000000000002','DW-9QX3RT',
  'c0000000-0000-4000-8000-000000000003','e0000000-0000-4000-8000-000000000001','paid','USD',
  51800, 0, 2590, 0, 54390,
  51800, 1000, 5180, 46620,
  'c0000000-0000-4000-8000-000000000002', 3000, 1554, 3626
) on conflict (id) do nothing;

-- Đơn 3: Linh mua tour Abu Dhabi, không ai giới thiệu → CHỜ THANH TOÁN.
insert into public.bookings (
  id, reference, user_id, merchant_id, status, currency,
  subtotal_minor, discount_minor, tax_minor, fee_minor, customer_total_minor,
  commission_base_minor, commission_rate_bps, platform_commission_minor, merchant_revenue_minor,
  referral_share_bps, referral_reward_minor, platform_net_minor
) values (
  '02000000-0000-4000-8000-000000000003','DW-5H8NWZ',
  'c0000000-0000-4000-8000-000000000001','e0000000-0000-4000-8000-000000000001','pending_payment','USD',
  56000, 5000, 2550, 0, 53550,
  51000, 1000, 5100, 45900,
  0, 0, 5100
) on conflict (id) do nothing;

-- Đơn 4: đã huỷ và hoàn tiền toàn bộ.
insert into public.bookings (
  id, reference, user_id, merchant_id, status, currency,
  subtotal_minor, discount_minor, tax_minor, fee_minor, customer_total_minor,
  commission_base_minor, commission_rate_bps, platform_commission_minor, merchant_revenue_minor,
  referral_share_bps, referral_reward_minor, platform_net_minor, cancelled_at
) values (
  '02000000-0000-4000-8000-000000000004','DW-3TY6BV',
  'c0000000-0000-4000-8000-000000000003','e0000000-0000-4000-8000-000000000001','refunded','USD',
  145000, 0, 7250, 0, 152250,
  145000, 1000, 14500, 130500,
  0, 0, 14500, now() - interval '5 days'
) on conflict (id) do nothing;

insert into public.booking_items (booking_id, service_id, package_id, service_title_snapshot, package_name_snapshot, service_date, start_time, adults, children, unit_price_adult_minor, line_total_minor, currency) values
  ('02000000-0000-4000-8000-000000000001','f0000000-0000-4000-8000-000000000001','01000000-0000-4000-8000-000000000001','Safari sa mạc buổi chiều kèm tiệc BBQ','Tiêu chuẩn', current_date - 12, '15:00', 2, 0, 15000, 30000,'USD'),
  ('02000000-0000-4000-8000-000000000002','f0000000-0000-4000-8000-000000000002','01000000-0000-4000-8000-000000000004','Vé Burj Khalifa tầng 124 & 125','Giờ hoàng hôn', current_date + 14, '17:30', 2, 0, 25900, 51800,'USD'),
  ('02000000-0000-4000-8000-000000000003','f0000000-0000-4000-8000-000000000005','01000000-0000-4000-8000-000000000008','Tour Abu Dhabi trọn ngày từ Dubai','Tour ghép', current_date + 21, '08:00', 2, 0, 28000, 56000,'USD'),
  ('02000000-0000-4000-8000-000000000004','f0000000-0000-4000-8000-000000000003','01000000-0000-4000-8000-000000000005','Thuê du thuyền riêng Dubai Marina 2 giờ','Thuê nguyên thuyền 2 giờ', current_date - 3, '16:00', 8, 0, 0, 145000,'USD')
on conflict do nothing;

insert into public.payments (booking_id, provider, provider_intent_id, status, amount_minor, currency, method_brand, method_last4, idempotency_key, paid_at) values
  ('02000000-0000-4000-8000-000000000001','stripe','pi_seed_0001','succeeded', 31500,'USD','visa','4242','seed-idem-0001', now() - interval '14 days'),
  ('02000000-0000-4000-8000-000000000002','stripe','pi_seed_0002','succeeded', 54390,'USD','mastercard','5454','seed-idem-0002', now() - interval '2 days'),
  ('02000000-0000-4000-8000-000000000004','stripe','pi_seed_0004','refunded',  152250,'USD','visa','4242','seed-idem-0004', now() - interval '9 days')
on conflict do nothing;

update public.payments set amount_refunded_minor = 152250 where provider_intent_id = 'pi_seed_0004';

insert into public.vouchers (booking_id, code, qr_payload, status, service_date, start_time, guest_count, meeting_point) values
  ('02000000-0000-4000-8000-000000000001','DW-VCH-7K2M4P-01','v1.seed.signature.0001','redeemed', current_date - 12, '15:00', 2,'Sảnh khách sạn, 15:00'),
  ('02000000-0000-4000-8000-000000000002','DW-VCH-9QX3RT-01','v1.seed.signature.0002','confirmed', current_date + 14, '17:30', 2,'Quầy At The Top, tầng hầm Dubai Mall')
on conflict do nothing;

update public.vouchers set redeemed_at = now() - interval '12 days',
                           redeemed_by = 'b0000000-0000-4000-8000-000000000001'
 where code = 'DW-VCH-7K2M4P-01';

-- Thưởng giới thiệu: đơn 1 đã hết thời hạn khiếu nại → available (rút được).
insert into public.referral_rewards (booking_id, referrer_user_id, referred_user_id, status, commission_minor, share_bps, amount_minor, currency, available_at) values
  ('02000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000002','available', 3000, 3000, 900,'USD', now() - interval '7 days')
on conflict do nothing;

-- Đơn 2 chưa dùng dịch vụ → thưởng của Minh còn pending.
insert into public.referral_rewards (booking_id, referrer_user_id, referred_user_id, status, commission_minor, share_bps, amount_minor, currency) values
  ('02000000-0000-4000-8000-000000000002','c0000000-0000-4000-8000-000000000002','c0000000-0000-4000-8000-000000000003','pending', 5180, 3000, 1554,'USD')
on conflict do nothing;

-- Ghi tiền thưởng đã mở khoá vào ví của Linh.
insert into public.wallet_transactions (wallet_id, direction, amount_minor, currency, balance_kind, source_type, description)
select w.id, 'credit', 900, 'USD', 'available', 'referral_reward', 'Thưởng giới thiệu đơn DW-7K2M4P'
  from public.wallets w where w.user_id = 'c0000000-0000-4000-8000-000000000001';

update public.wallets set balance_available_minor = 900
 where user_id = 'c0000000-0000-4000-8000-000000000001';

-- ─── ĐÁNH GIÁ ───────────────────────────────────────────────────────────────
insert into public.reviews (booking_id, service_id, merchant_id, user_id, rating_overall, rating_quality, rating_value, rating_service, rating_accuracy, comment) values
  ('02000000-0000-4000-8000-000000000001','f0000000-0000-4000-8000-000000000001','e0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000002',
   5, 5, 4, 5, 5,
   'Tài xế đón đúng giờ, lái cồn cát chắc tay mà không làm ai say. Đồ ăn ở trại nhiều món, có món chay cho mẹ mình. Điểm trừ nhỏ là khu chụp ảnh hoàng hôn hơi đông.')
on conflict do nothing;

insert into public.merchant_responses (review_id, merchant_id, author_id, body)
select r.id, r.merchant_id, 'b0000000-0000-4000-8000-000000000001',
       'Cảm ơn anh Minh. Từ tháng sau chúng tôi tách hai khung giờ chụp hoàng hôn để giảm đông. Mong được đón gia đình anh lần tới.'
  from public.reviews r limit 1
on conflict do nothing;

-- ─── KHUYẾN MÃI ─────────────────────────────────────────────────────────────
insert into public.coupons (code, kind, percent_bps, amount_minor, min_order_minor, max_discount_minor, currency, funded_by, usage_limit_total, starts_at, ends_at) values
  ('DUBAI10',  'percent', 1000, null, 20000, 10000,'USD','platform',  500, now() - interval '10 days', now() + interval '60 days'),
  ('WELCOME50','fixed',   null, 5000, 30000, null, 'USD','platform', 1000, now() - interval '5 days',  now() + interval '90 days')
on conflict (code) do nothing;

-- ─── TRANG NỘI DUNG ─────────────────────────────────────────────────────────
insert into public.pages (id, slug, status, published_at) values
  ('03000000-0000-4000-8000-000000000001','terms','published', now()),
  ('03000000-0000-4000-8000-000000000002','privacy','published', now()),
  ('03000000-0000-4000-8000-000000000003','cookies','published', now()),
  ('03000000-0000-4000-8000-000000000004','cancellation-refund','published', now()),
  ('03000000-0000-4000-8000-000000000005','merchant-terms','published', now()),
  ('03000000-0000-4000-8000-000000000006','referral-terms','published', now())
on conflict (slug) do nothing;

insert into public.page_translations (page_id, locale, title, body_md) values
  ('03000000-0000-4000-8000-000000000006','vi','Điều khoản chương trình giới thiệu',
   E'## Cách hoạt động\n\nMỗi tài khoản có một mã giới thiệu riêng. Khi người được bạn giới thiệu hoàn tất một giao dịch hợp lệ, bạn nhận **30% hoa hồng mà DubaiWay thực nhận** từ giao dịch đó.\n\n## Ví dụ\n\nĐơn hàng 1.000 USD:\n- Merchant nhận 900 USD\n- Hoa hồng DubaiWay: 100 USD\n- Bạn nhận: 30 USD (30% của 100 USD)\n\nLưu ý: 30% tính trên **hoa hồng**, không phải trên giá trị đơn hàng.\n\n## Chỉ một tầng\n\nChương trình chỉ có một tầng. Nếu bạn giới thiệu B và B giới thiệu C, bạn nhận thưởng từ giao dịch của B nhưng **không** nhận từ giao dịch của C. Đây không phải mô hình đa cấp.\n\n## Khi nào thưởng được rút\n\nThưởng chuyển sang trạng thái rút được khi đủ tất cả điều kiện: đơn đã thanh toán, dịch vụ đã hoàn thành, hết thời hạn khiếu nại, không phát sinh hoàn tiền và không có dấu hiệu gian lận.\n\n## Không chấp nhận\n\nTự giới thiệu chính mình, tạo tài khoản ảo, hoặc dùng nhiều tài khoản để nhận thưởng. Các trường hợp nghi vấn sẽ được xem xét thủ công trước khi kết luận.'),
  ('03000000-0000-4000-8000-000000000006','en','Referral Programme Terms',
   E'## How it works\n\nEvery account has its own referral code. When someone you referred completes an eligible transaction, you receive **30% of the commission DubaiWay actually earns** on it.\n\n## Example\n\nOn a 1,000 USD order:\n- Merchant receives 900 USD\n- DubaiWay commission: 100 USD\n- You receive: 30 USD (30% of 100 USD)\n\nNote: the 30% is calculated on the **commission**, not on the order value.\n\n## Single level only\n\nThe programme has exactly one level. If you refer B and B refers C, you earn on B''s transactions but **not** on C''s. This is not a multi-level scheme.\n\n## When rewards become withdrawable\n\nA reward becomes withdrawable once all conditions are met: the order is paid, the service is completed, the dispute window has closed, no refund was issued, and no fraud signals are outstanding.\n\n## Not permitted\n\nReferring yourself, creating fake accounts, or using multiple accounts to collect rewards. Suspicious cases are reviewed manually before any conclusion is reached.')
on conflict do nothing;
