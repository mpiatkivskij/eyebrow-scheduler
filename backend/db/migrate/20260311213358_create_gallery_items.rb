class CreateGalleryItems < ActiveRecord::Migration[8.0]
  def change
    create_table :gallery_items do |t|
      t.string :image_url
      t.string :description_uk
      t.string :description_en
      t.integer :sort_order
      t.string :category

      t.timestamps
    end
  end
end
