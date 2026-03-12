class CreateServices < ActiveRecord::Migration[8.0]
  def change
    create_table :services do |t|
      t.string :name_uk, null: false
      t.string :name_en, null: false
      t.text :description_uk
      t.text :description_en
      t.decimal :price, precision: 8, scale: 2, null: false
      t.integer :duration_minutes, null: false
      t.string :category
      t.boolean :active, default: true, null: false

      t.timestamps
    end
  end
end
