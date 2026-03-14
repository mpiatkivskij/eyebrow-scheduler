class ChangeClientPhoneNullableOnAppointments < ActiveRecord::Migration[8.0]
  def change
    change_column_null :appointments, :client_phone, true
  end
end
