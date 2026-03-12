class ScheduleBreak < ApplicationRecord
  belongs_to :work_schedule

  validates :start_time, :end_time, presence: true
end
