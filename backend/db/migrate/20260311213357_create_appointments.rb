class CreateAppointments < ActiveRecord::Migration[8.0]
  def change
    create_table :appointments do |t|
      t.string :client_name, null: false
      t.string :client_phone, null: false
      t.string :client_email
      t.references :service, null: false, foreign_key: true
      t.datetime :start_time, null: false
      t.datetime :end_time, null: false
      t.integer :status, default: 0, null: false
      t.string :language_used, default: 'en'
      t.text :notes

      t.timestamps
    end

    add_index :appointments, :start_time
    add_index :appointments, :status
  end
end
