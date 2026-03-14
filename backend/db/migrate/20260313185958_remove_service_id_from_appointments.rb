class RemoveServiceIdFromAppointments < ActiveRecord::Migration[8.0]
  def change
    remove_column :appointments, :service_id, :bigint
  end
end
