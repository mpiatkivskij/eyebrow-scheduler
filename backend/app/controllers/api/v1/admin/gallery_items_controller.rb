module Api
  module V1
    module Admin
      class GalleryItemsController < ApplicationController
        before_action :authenticate_admin!
        before_action :set_item, only: [:update, :destroy]

        def create
          item = GalleryItem.new(gallery_params)
          if item.save
            render json: item, status: :created
          else
            render json: { errors: item.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          if @item.update(gallery_params)
            render json: @item
          else
            render json: { errors: @item.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          @item.destroy!
          head :no_content
        end

        private

        def set_item
          @item = GalleryItem.find(params[:id])
        end

        def gallery_params
          params.require(:gallery_item).permit(:image_url, :description_uk, :description_en, :sort_order, :category, :media_type)
        end
      end
    end
  end
end
