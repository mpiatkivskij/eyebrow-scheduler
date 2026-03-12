module Api
  module V1
    module Admin
      class ServicesController < ApplicationController
        before_action :authenticate_admin!
        before_action :set_service, only: [:show, :update, :destroy]

        def index
          services = Service.all.order(created_at: :desc)
          render json: services
        end

        def show
          render json: @service
        end

        def create
          service = Service.new(service_params)
          if service.save
            render json: service, status: :created
          else
            render json: { errors: service.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          if @service.update(service_params)
            render json: @service
          else
            render json: { errors: @service.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          if @service.destroy
            head :no_content
          else
            render json: { errors: @service.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def set_service
          @service = Service.find(params[:id])
        end

        def service_params
          params.require(:service).permit(:name_uk, :name_en, :description_uk, :description_en, :price, :duration_minutes, :category, :active)
        end
      end
    end
  end
end
