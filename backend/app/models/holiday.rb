class Holiday < ApplicationRecord
  validates :date, presence: true, uniqueness: true
end
