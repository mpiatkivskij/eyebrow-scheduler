module Api
  module V1
    class GalleryItemsController < ApplicationController
      def index
        items = GalleryItem.all
        render json: items
      end
    end
  end
end
