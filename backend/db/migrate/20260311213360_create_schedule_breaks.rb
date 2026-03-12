class CreateScheduleBreaks < ActiveRecord::Migration[8.0]
  def change
    create_table :schedule_breaks do |t|
      t.references :work_schedule, null: false, foreign_key: true
      t.time :start_time, null: false
      t.time :end_time, null: false

      t.timestamps
    end
  end
end
