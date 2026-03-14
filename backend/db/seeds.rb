# Create admin user
AdminUser.find_or_create_by!(email: 'piatkivska') do |user|
  password = SecureRandom.hex(12) # Generate a random password
  user.password = password
  user.password_confirmation = password
end
puts "Admin user created: piatkivska / #{password}"

# Create services
Appointment.destroy_all
Service.destroy_all
services_data = [
  {
    name_en: 'Eyebrow Correction (wax/tweezers)',
    name_uk: 'Корекція брів (віск/пінцет)',
    description_en: 'Eyebrow shaping using wax and tweezers.',
    description_uk: 'Корекція брів за допомогою воску та пінцета.',
    price: 200.00,
    duration_minutes: 45,
    category: 'brows'
  },
  {
    name_en: 'Correction + Tinting',
    name_uk: 'Корекція + фарбування',
    description_en: 'Eyebrow correction and semi-permanent tinting.',
    description_uk: 'Корекція брів та напівперманентне фарбування.',
    price: 350.00,
    duration_minutes: 90,
    category: 'brows'
  },
  {
    name_en: 'Correction + Lamination',
    name_uk: 'Корекція + ламінування брів',
    description_en: 'Eyebrow correction and lamination for a defined look.',
    description_uk: 'Корекція та ламінування брів для виразного вигляду.',
    price: 350.00,
    duration_minutes: 80,
    category: 'brows'
  },
  {
    name_en: 'Correction + Tinting + Lamination',
    name_uk: 'Корекція + фарбування + ламінування',
    description_en: 'Complete eyebrow transformation: correction, tinting, and lamination.',
    description_uk: 'Повний комплекс для брів: корекція, фарбування та ламінування.',
    price: 500.00,
    duration_minutes: 120,
    category: 'brows'
  },
  {
    name_en: 'Facial Fuzz Removal (1 Zone)',
    name_uk: 'Видалення пушка на обличчі - 1 зона',
    description_en: 'Professional removal of peach fuzz on one facial zone.',
    description_uk: 'Професійне видалення пушка на одній зоні обличчя.',
    price: 50.00,
    duration_minutes: 20,
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
GalleryItem.destroy_all
gallery_data = [
  { image_url: 'https://res.cloudinary.com/dme0dknht/image/upload/v1773427832/photo_2026-03-13_20-46-15_opfev1.jpg', description_en: 'Brow styling result', description_uk: 'Корекція з ламінуванням', category: 'brows', sort_order: 1, media_type: 'photo' },
  { image_url: 'https://res.cloudinary.com/dme0dknht/video/upload/v1773417133/IMG_9659_sibpux.mp4', description_en: 'Brow procedure video', description_uk: 'Корекція з ламінуванням', category: 'brows', sort_order: 2, media_type: 'video' },
  { image_url: 'https://res.cloudinary.com/dme0dknht/image/upload/v1773427832/photo_2026-03-13_20-46-23_aalnpn.jpg', description_en: 'Perfect brow shape', description_uk: 'Корекція з фарбуванням', category: 'brows', sort_order: 3, media_type: 'photo' },
  { image_url: 'https://res.cloudinary.com/dme0dknht/video/upload/v1773417132/IMG_9587_obujei.mp4', description_en: 'Brow transformation', description_uk: 'Корекція з фарбуванням', category: 'brows', sort_order: 4, media_type: 'video' },
  { image_url: 'https://res.cloudinary.com/dme0dknht/image/upload/v1773417130/photo_2026-03-13_17-50-20_yhycbk.jpg', description_en: 'Brow artist work', description_uk: 'Корекція з фарбуванням', category: 'brows', sort_order: 5, media_type: 'photo' },
  { image_url: 'https://res.cloudinary.com/dme0dknht/image/upload/v1773427832/photo_2026-03-13_20-47-14_cqjawx.jpg', description_en: 'Professional brow look', description_uk: 'Корекція з ламінуванням та фарбуванням', category: 'brows', sort_order: 6, media_type: 'photo' },
  { image_url: 'https://res.cloudinary.com/dme0dknht/image/upload/v1773427832/photo_2026-03-13_20-46-27_acnuas.jpg', description_en: 'Natural brows', description_uk: 'Корекція з фарбуванням', category: 'brows', sort_order: 7, media_type: 'photo' },
  { image_url: 'https://res.cloudinary.com/dme0dknht/image/upload/v1773427832/photo_2026-03-13_20-46-30_dmpkiy.jpg', description_en: 'Elegant brow results', description_uk: 'Корекція з фарбуванням', category: 'brows', sort_order: 8, media_type: 'photo' },
]

gallery_data.each do |data|
  GalleryItem.create!(data)
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
