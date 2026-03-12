module Api
  module V1
    class AvailableSlotsController < ApplicationController
      def index
        date = Date.parse(params[:date])
        service = Service.active.find(params[:service_id])
        duration = service.duration_minutes

        # Get work schedule for that day
        schedule = WorkSchedule.find_by(day_of_week: date.wday)

        if schedule.nil? || schedule.is_day_off? || Holiday.exists?(date: date)
          render json: { slots: [], message: 'Not a working day' }
          return
        end

        # Generate all possible slots
        slots = generate_slots(date, schedule, duration)

        # Remove slots that overlap with existing appointments
        booked = Appointment.where.not(status: :cancelled)
          .where('start_time >= ? AND start_time < ?', date.beginning_of_day, date.end_of_day)
          .pluck(:start_time, :end_time)

        # Remove slots that overlap with breaks
        breaks = schedule.schedule_breaks.pluck(:start_time, :end_time)

        available = slots.reject do |slot_start, slot_end|
          booked.any? { |bs, be| slot_start < be && slot_end > bs } ||
            breaks.any? do |br_start, br_end|
              br_start_dt = date.to_datetime.change(hour: br_start.hour, min: br_start.min)
              br_end_dt = date.to_datetime.change(hour: br_end.hour, min: br_end.min)
              slot_start < br_end_dt && slot_end > br_start_dt
            end
        end

        render json: {
          slots: available.map { |s, e| { start_time: s.iso8601, end_time: e.iso8601 } },
          date: date.iso8601
        }
      end

      private

      def generate_slots(date, schedule, duration)
        slots = []
        current = date.to_datetime.change(hour: schedule.start_time.hour, min: schedule.start_time.min)
        day_end = date.to_datetime.change(hour: schedule.end_time.hour, min: schedule.end_time.min)

        while current + duration.minutes <= day_end
          slot_end = current + duration.minutes
          slots << [current, slot_end]
          current += 30.minutes # 30-minute intervals
        end

        slots
      end
    end
  end
end
