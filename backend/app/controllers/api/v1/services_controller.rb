module Api
  module V1
    class ServicesController < ApplicationController
      def index
        services = Service.active
        render json: services
      end

      def show
        service = Service.find(params[:id])
        render json: service
      end
    end
  end
end
