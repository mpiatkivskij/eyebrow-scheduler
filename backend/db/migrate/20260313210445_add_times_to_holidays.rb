class AddTimesToHolidays < ActiveRecord::Migration[8.0]
  def change
    add_column :holidays, :start_time, :time
    add_column :holidays, :end_time, :time
    remove_index :holidays, :date, if_exists: true
  end
end
