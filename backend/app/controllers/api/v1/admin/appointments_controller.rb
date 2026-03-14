module Api
  module V1
    module Admin
      class AppointmentsController < ApplicationController
        before_action :authenticate_admin!
        before_action :set_appointment, only: [:show, :update, :destroy]

        def index
          appointments = Appointment.includes(:services).order(start_time: :desc)

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

          render json: appointments.as_json(include: :services, methods: [:custom_price, :custom_duration])
        end

        def show
          render json: appointment_json(@appointment)
        end

        def create
          appointment = Appointment.new(create_params)
          assign_services(appointment) unless appointment.is_time_off

          if appointment.save
            render json: appointment_json(appointment), status: :created
          else
            render json: { errors: appointment.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          assign_services(@appointment) if params[:appointment][:service_ids].present? && !@appointment.is_time_off

          if @appointment.update(update_params)
            render json: appointment_json(@appointment.reload)
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

        def create_params
          params.require(:appointment).permit(
            :client_name, :client_phone, :client_email,
            :start_time, :end_time, :status, :notes,
            :custom_price, :custom_duration, :is_time_off
          )
        end

        def update_params
          params.require(:appointment).permit(
            :client_name, :client_phone, :client_email,
            :start_time, :end_time, :status, :notes,
            :custom_price, :custom_duration, :is_time_off
          )
        end

        def appointment_json(appointment)
          appointment.as_json(include: :services, methods: [:custom_price, :custom_duration])
        end

        def assign_services(appointment)
          service_ids = params[:appointment][:service_ids]
          return unless service_ids.present?

          services = Service.where(id: service_ids)
          appointment.services = services

          # Auto-calculate end_time from services if not explicitly set or if services changed
          if appointment.start_time.present? && !params[:appointment][:end_time].present?
            total_duration = appointment.custom_duration || services.sum(:duration_minutes)
            appointment.end_time = appointment.start_time + total_duration.minutes
          end
        end
      end
    end
  end
end
