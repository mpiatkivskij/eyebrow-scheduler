class Appointment < ApplicationRecord
  has_many :appointment_services, dependent: :destroy
  has_many :services, through: :appointment_services

  enum :status, { pending: 0, confirmed: 1, cancelled: 2, completed: 3 }

  validates :client_name, :start_time, :end_time, presence: true
  validates :client_phone, presence: true, unless: :is_time_off
  validates :services, presence: true, unless: :is_time_off
  validates :client_phone, format: { with: /\A[\d\s\+\-\(\)]+\z/ }, unless: :is_time_off
  validate :end_time_after_start_time
  validate :no_overlapping_appointments, on: :create

  scope :upcoming, -> { where('start_time > ?', Time.current).order(start_time: :asc) }
  scope :today, -> { where(start_time: Time.current.beginning_of_day..Time.current.end_of_day) }
  scope :this_week, -> { where(start_time: Time.current.beginning_of_week..Time.current.end_of_week) }

  private

  def end_time_after_start_time
    return unless start_time && end_time
    errors.add(:end_time, :must_be_after_start) if end_time <= start_time
  end

  def no_overlapping_appointments
    return unless start_time && end_time
    overlapping = Appointment.where.not(status: :cancelled)
      .where('start_time < ? AND end_time > ?', end_time, start_time)
    overlapping = overlapping.where.not(id: id) if persisted?
    errors.add(:base, :time_slot_booked) if overlapping.exists?
  end
end
