module Api
  module V1
    class AppointmentsController < ApplicationController
      def create
        service_ids = params[:service_ids]
        services = Service.active.where(id: service_ids)
        total_duration = services.sum(:duration_minutes)

        appointment = Appointment.new(appointment_params)
        appointment.services = services
        appointment.end_time = appointment.start_time + total_duration.minutes if appointment.start_time

        if appointment.save
          TelegramNotifier.notify_new_appointment(appointment)
          render json: appointment, status: :created
        else
          render json: { errors: appointment.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def appointment_params
        params.require(:appointment).permit(:client_name, :client_phone, :client_email, :start_time, :language_used, :notes)
      end
    end
  end
end
