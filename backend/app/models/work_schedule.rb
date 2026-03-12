class WorkSchedule < ApplicationRecord
  has_many :schedule_breaks, dependent: :destroy
  accepts_nested_attributes_for :schedule_breaks, allow_destroy: true

  validates :day_of_week, presence: true, uniqueness: true,
            inclusion: { in: 0..6 }
  validates :start_time, :end_time, presence: true, unless: :is_day_off?

  DAY_NAMES = %w[sunday monday tuesday wednesday thursday friday saturday].freeze

  def day_name
    DAY_NAMES[day_of_week]
  end
end
