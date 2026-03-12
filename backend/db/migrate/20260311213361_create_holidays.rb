class CreateHolidays < ActiveRecord::Migration[8.0]
  def change
    create_table :holidays do |t|
      t.date :date
      t.string :description

      t.timestamps
    end
  end
end
