class CreateWorkSchedules < ActiveRecord::Migration[8.0]
  def change
    create_table :work_schedules do |t|
      t.integer :day_of_week, null: false
      t.time :start_time
      t.time :end_time
      t.boolean :is_day_off, default: false, null: false

      t.timestamps
    end

    add_index :work_schedules, :day_of_week, unique: true
  end
end
