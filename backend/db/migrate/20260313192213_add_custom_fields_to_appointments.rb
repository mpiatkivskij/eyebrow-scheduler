class AddCustomFieldsToAppointments < ActiveRecord::Migration[8.0]
  def change
    add_column :appointments, :custom_price, :decimal, precision: 8, scale: 2
    add_column :appointments, :custom_duration, :integer
  end
end
