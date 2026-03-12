class Service < ApplicationRecord
  has_many :appointments, dependent: :restrict_with_error

  validates :name_uk, :name_en, :price, :duration_minutes, presence: true
  validates :price, numericality: { greater_than: 0 }
  validates :duration_minutes, numericality: { greater_than: 0 }

  scope :active, -> { where(active: true) }

  def name(locale = :en)
    locale.to_s == 'uk' ? name_uk : name_en
  end

  def description(locale = :en)
    locale.to_s == 'uk' ? description_uk : description_en
  end
end
