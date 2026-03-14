class GalleryItem < ApplicationRecord
  validates :media_type, inclusion: { in: %w[photo video] }
  after_initialize :set_default_media_type, if: :new_record?

  validates :image_url, presence: true
  validates :sort_order, numericality: { only_integer: true }, allow_nil: true

  default_scope { order(sort_order: :asc, created_at: :desc) }

  def description(locale = :en)
    locale.to_s == 'uk' ? description_uk : description_en
  end

  private

  def set_default_media_type
    self.media_type ||= 'photo'
  end
end
