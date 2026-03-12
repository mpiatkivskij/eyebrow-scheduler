class GalleryItem < ApplicationRecord
  validates :image_url, presence: true
  validates :sort_order, numericality: { only_integer: true }, allow_nil: true

  default_scope { order(sort_order: :asc, created_at: :desc) }

  def description(locale = :en)
    locale.to_s == 'uk' ? description_uk : description_en
  end
end
