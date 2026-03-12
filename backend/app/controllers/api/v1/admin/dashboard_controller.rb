module Api
  module V1
    module Admin
      class DashboardController < ApplicationController
        before_action :authenticate_admin!

        def index
          today = Date.current
          week_start = today.beginning_of_week
          week_end = today.end_of_week
          month_start = today.beginning_of_month
          month_end = today.end_of_month

          today_appointments = Appointment.where(start_time: today.beginning_of_day..today.end_of_day)
                                          .where.not(status: :cancelled)
          week_appointments = Appointment.where(start_time: week_start.beginning_of_day..week_end.end_of_day)
                                         .where.not(status: :cancelled)
          month_appointments = Appointment.where(start_time: month_start.beginning_of_day..month_end.end_of_day)
                                          .where.not(status: :cancelled)

          upcoming = Appointment.includes(:service)
                                .where('start_time > ?', Time.current)
                                .where.not(status: :cancelled)
                                .order(start_time: :asc)
                                .limit(10)

          render json: {
            today_count: today_appointments.count,
            week_count: week_appointments.count,
            month_count: month_appointments.count,
            week_revenue: week_appointments.joins(:service).sum('services.price'),
            month_revenue: month_appointments.joins(:service).sum('services.price'),
            upcoming_appointments: upcoming.as_json(include: :service),
            total_services: Service.active.count,
            pending_count: Appointment.pending.where('start_time > ?', Time.current).count
          }
        end
      end
    end
  end
end
