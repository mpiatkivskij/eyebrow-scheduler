module Api
  module V1
    module Admin
      class AppointmentsController < ApplicationController
        before_action :authenticate_admin!
        before_action :set_appointment, only: [:show, :update, :destroy]

        def index
          appointments = Appointment.includes(:service).order(start_time: :desc)

          if params[:status].present?
            appointments = appointments.where(status: params[:status])
          end

          if params[:date].present?
            date = Date.parse(params[:date])
            appointments = appointments.where(start_time: date.beginning_of_day..date.end_of_day)
          end

          if params[:from].present? && params[:to].present?
            from = Date.parse(params[:from])
            to = Date.parse(params[:to])
            appointments = appointments.where(start_time: from.beginning_of_day..to.end_of_day)
          end

          render json: appointments, include: :service
        end

        def show
          render json: @appointment, include: :service
        end

        def update
          if @appointment.update(update_params)
            render json: @appointment
          else
            render json: { errors: @appointment.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          @appointment.destroy!
          head :no_content
        end

        private

        def set_appointment
          @appointment = Appointment.find(params[:id])
        end

        def update_params
          params.require(:appointment).permit(:status, :notes)
        end
      end
    end
  end
end
