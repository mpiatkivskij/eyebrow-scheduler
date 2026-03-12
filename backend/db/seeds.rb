# Create admin user
AdminUser.find_or_create_by!(email: 'admin@beautysalon.com') do |user|
  user.password = 'password123'
  user.password_confirmation = 'password123'
end
puts "Admin user created: admin@beautysalon.com / password123"

# Create services
services_data = [
  {
    name_en: 'Eyebrow Shaping',
    name_uk: 'Корекція брів',
    description_en: 'Professional eyebrow shaping and design to complement your facial features.',
    description_uk: 'Професійна корекція та дизайн брів, що підкреслюють риси обличчя.',
    price: 35.00,
    duration_minutes: 45,
    category: 'brows'
  },
  {
    name_en: 'Eyebrow Lamination',
    name_uk: 'Ламінування брів',
    description_en: 'Long-lasting eyebrow lamination for a fuller, more defined look.',
    description_uk: 'Довготривале ламінування брів для більш повного та виразного вигляду.',
    price: 55.00,
    duration_minutes: 60,
    category: 'brows'
  },
  {
    name_en: 'Eyebrow Tinting',
    name_uk: 'Фарбування брів',
    description_en: 'Semi-permanent eyebrow tinting for natural-looking color enhancement.',
    description_uk: 'Напівперманентне фарбування брів для природного підсилення кольору.',
    price: 25.00,
    duration_minutes: 30,
    category: 'brows'
  },
  {
    name_en: 'Eyelash Lift & Tint',
    name_uk: 'Ліфтинг та фарбування вій',
    description_en: 'Stunning eyelash lift with tinting for a wide-eyed, dramatic look.',
    description_uk: 'Приголомшливий ліфтинг вій з фарбуванням для виразного та ефектного погляду.',
    price: 65.00,
    duration_minutes: 75,
    category: 'eyelids'
  },
  {
    name_en: 'Classic Eyelash Extensions',
    name_uk: 'Класичне нарощування вій',
    description_en: 'Natural-looking classic eyelash extensions for everyday elegance.',
    description_uk: 'Класичне нарощування вій з природним виглядом для щоденної елегантності.',
    price: 90.00,
    duration_minutes: 120,
    category: 'eyelids'
  },
  {
    name_en: 'Facial Cleansing',
    name_uk: 'Чищення обличчя',
    description_en: 'Deep facial cleansing treatment for radiant, glowing skin.',
    description_uk: 'Глибоке чищення обличчя для сяючої та здорової шкіри.',
    price: 75.00,
    duration_minutes: 60,
    category: 'face'
  },
  {
    name_en: 'Anti-Aging Facial',
    name_uk: 'Омолоджуючий догляд',
    description_en: 'Premium anti-aging facial treatment with collagen and hyaluronic acid.',
    description_uk: 'Преміальний омолоджуючий догляд з колагеном та гіалуроновою кислотою.',
    price: 120.00,
    duration_minutes: 90,
    category: 'face'
  },
  {
    name_en: 'Hydrating Face Mask',
    name_uk: 'Зволожуюча маска для обличчя',
    description_en: 'Intensive hydration mask for dry and sensitive skin.',
    description_uk: 'Інтенсивна зволожуюча маска для сухої та чутливої шкіри.',
    price: 45.00,
    duration_minutes: 45,
    category: 'face'
  }
]

services_data.each do |data|
  Service.find_or_create_by!(name_en: data[:name_en]) do |service|
    service.assign_attributes(data)
  end
end
puts "#{Service.count} services created"

# Create gallery items
gallery_data = [
  { image_url: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600', description_en: 'Perfect eyebrow shaping', description_uk: 'Ідеальна форма брів', category: 'brows', sort_order: 1 },
  { image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600', description_en: 'Natural beauty look', description_uk: 'Природний вигляд краси', category: 'face', sort_order: 2 },
  { image_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600', description_en: 'Stunning eyelash extensions', description_uk: 'Приголомшливе нарощування вій', category: 'eyelids', sort_order: 3 },
  { image_url: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600', description_en: 'Facial treatment results', description_uk: 'Результати догляду за обличчям', category: 'face', sort_order: 4 },
  { image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600', description_en: 'Eyebrow lamination result', description_uk: 'Результат ламінування брів', category: 'brows', sort_order: 5 },
  { image_url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600', description_en: 'Glowing skin after facial', description_uk: 'Сяюча шкіра після процедури', category: 'face', sort_order: 6 },
]

gallery_data.each do |data|
  GalleryItem.find_or_create_by!(image_url: data[:image_url]) do |item|
    item.assign_attributes(data)
  end
end
puts "#{GalleryItem.count} gallery items created"

# Create work schedule (Mon-Sat, 9:00-18:00, Sun off)
(0..6).each do |day|
  WorkSchedule.find_or_create_by!(day_of_week: day) do |ws|
    if day == 0 # Sunday
      ws.is_day_off = true
    else
      ws.start_time = '09:00'
      ws.end_time = '18:00'
      ws.is_day_off = false
    end
  end
end

# Add lunch break for working days
WorkSchedule.where(is_day_off: false).each do |ws|
  ws.schedule_breaks.find_or_create_by!(start_time: '13:00') do |br|
    br.end_time = '14:00'
  end
end
puts "Work schedules created (Mon-Sat 9:00-18:00, Break 13:00-14:00, Sun off)"
