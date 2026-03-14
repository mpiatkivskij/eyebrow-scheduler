class AddMediaTypeToGalleryItems < ActiveRecord::Migration[8.0]
  def change
    add_column :gallery_items, :media_type, :string
  end
end
