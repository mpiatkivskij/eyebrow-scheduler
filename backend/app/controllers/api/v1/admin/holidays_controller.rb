module Api
  module V1
    module Admin
      class HolidaysController < ApplicationController
        before_action :authenticate_admin!

        def index
          holidays = Holiday.order(date: :asc)
          render json: holidays
        end

        def create
          holiday = Holiday.new(holiday_params)
          if holiday.save
            render json: holiday, status: :created
          else
            render json: { errors: holiday.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          Holiday.find(params[:id]).destroy!
          head :no_content
        end

        private

        def holiday_params
          params.require(:holiday).permit(:date, :description, :start_time, :end_time)
        end
      end
    end
  end
end
