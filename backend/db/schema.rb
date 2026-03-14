# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_03_13_221428) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "admin_users", force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_admin_users_on_email", unique: true
  end

  create_table "appointment_services", force: :cascade do |t|
    t.bigint "appointment_id", null: false
    t.bigint "service_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["appointment_id"], name: "index_appointment_services_on_appointment_id"
    t.index ["service_id"], name: "index_appointment_services_on_service_id"
  end

  create_table "appointments", force: :cascade do |t|
    t.string "client_name", null: false
    t.string "client_phone"
    t.string "client_email"
    t.datetime "start_time", null: false
    t.datetime "end_time", null: false
    t.integer "status", default: 0, null: false
    t.string "language_used", default: "en"
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.decimal "custom_price", precision: 8, scale: 2
    t.integer "custom_duration"
    t.boolean "is_time_off", default: false, null: false
    t.index ["start_time"], name: "index_appointments_on_start_time"
    t.index ["status"], name: "index_appointments_on_status"
  end

  create_table "gallery_items", force: :cascade do |t|
    t.string "image_url"
    t.string "description_uk"
    t.string "description_en"
    t.integer "sort_order"
    t.string "category"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "media_type"
  end

  create_table "holidays", force: :cascade do |t|
    t.date "date"
    t.string "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.time "start_time"
    t.time "end_time"
  end

  create_table "schedule_breaks", force: :cascade do |t|
    t.bigint "work_schedule_id", null: false
    t.time "start_time", null: false
    t.time "end_time", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["work_schedule_id"], name: "index_schedule_breaks_on_work_schedule_id"
  end

  create_table "services", force: :cascade do |t|
    t.string "name_uk", null: false
    t.string "name_en", null: false
    t.text "description_uk"
    t.text "description_en"
    t.decimal "price", precision: 8, scale: 2, null: false
    t.integer "duration_minutes", null: false
    t.string "category"
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "work_schedules", force: :cascade do |t|
    t.integer "day_of_week", null: false
    t.time "start_time"
    t.time "end_time"
    t.boolean "is_day_off", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["day_of_week"], name: "index_work_schedules_on_day_of_week", unique: true
  end

  add_foreign_key "appointment_services", "appointments"
  add_foreign_key "appointment_services", "services"
  add_foreign_key "schedule_breaks", "work_schedules"
end
