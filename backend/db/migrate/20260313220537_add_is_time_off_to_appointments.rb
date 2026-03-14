class AddIsTimeOffToAppointments < ActiveRecord::Migration[8.0]
  def change
    add_column :appointments, :is_time_off, :boolean, default: false, null: false
  end
end
