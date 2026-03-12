module Api
  module V1
    module Admin
      class WorkSchedulesController < ApplicationController
        before_action :authenticate_admin!

        def index
          schedules = WorkSchedule.includes(:schedule_breaks).order(:day_of_week)
          render json: schedules.as_json(include: :schedule_breaks)
        end

        def update
          schedule = WorkSchedule.find(params[:id])
          if schedule.update(schedule_params)
            render json: schedule.as_json(include: :schedule_breaks)
          else
            render json: { errors: schedule.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def bulk_update
          params[:schedules].each do |schedule_params|
            schedule = WorkSchedule.find_or_initialize_by(day_of_week: schedule_params[:day_of_week])
            schedule.assign_attributes(schedule_params.permit(:start_time, :end_time, :is_day_off,
              schedule_breaks_attributes: [:id, :start_time, :end_time, :_destroy]))
            schedule.save!
          end
          schedules = WorkSchedule.includes(:schedule_breaks).order(:day_of_week)
          render json: schedules.as_json(include: :schedule_breaks)
        rescue ActiveRecord::RecordInvalid => e
          render json: { errors: [e.message] }, status: :unprocessable_entity
        end

        private

        def schedule_params
          params.require(:work_schedule).permit(:day_of_week, :start_time, :end_time, :is_day_off,
            schedule_breaks_attributes: [:id, :start_time, :end_time, :_destroy])
        end
      end
    end
  end
end
