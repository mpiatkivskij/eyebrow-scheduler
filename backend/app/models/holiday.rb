class Holiday < ApplicationRecord
  validates :date, presence: true
  validate :times_must_be_paired

  def full_day?
    start_time.nil? && end_time.nil?
  end

  private

  def times_must_be_paired
    if start_time.present? ^ end_time.present?
      errors.add(:base, "Both start and end time must be provided")
    elsif start_time.present? && end_time.present? && start_time >= end_time
      errors.add(:base, "End time must be after start time")
    end
  end
end
