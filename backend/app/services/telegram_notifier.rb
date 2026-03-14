require "net/http"
require "json"

class TelegramNotifier
  TELEGRAM_API_URL = "https://api.telegram.org".freeze

  def self.notify_new_appointment(appointment)
    return unless token.present? && chat_id.present?

    appointment = appointment.reload if appointment.services.loaded? == false
    services = appointment.services.map { |s| s.name_uk }.join(", ")
    start_time = appointment.start_time.in_time_zone
    end_time = appointment.end_time.in_time_zone
    date = start_time.strftime("%d.%m.%Y")
    time = "#{start_time.strftime('%H:%M')} – #{end_time.strftime('%H:%M')}"

    text = <<~MSG
      📋 *Новий запис\\!*

      👤 *Клієнт:* #{escape_markdown(appointment.client_name)}
      📞 *Телефон:* #{escape_markdown(appointment.client_phone)}
      👁 *Послуги:* #{escape_markdown(services)}
      📅 *Дата:* #{escape_markdown(date)}
      🕐 *Час:* #{escape_markdown(time)}
    MSG

    text += "📧 *Email:* #{escape_markdown(appointment.client_email)}\n" if appointment.client_email.present?
    text += "📝 *Примітки:* #{escape_markdown(appointment.notes)}\n" if appointment.notes.present?

    send_message(text)
  rescue StandardError => e
    Rails.logger.error("[TelegramNotifier] Failed to send notification: #{e.message}")
  end

  def self.send_message(text)
    uri = URI("#{TELEGRAM_API_URL}/bot#{token}/sendMessage")

    params = {
      chat_id: chat_id,
      text: text,
      parse_mode: "MarkdownV2"
    }

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.open_timeout = 5
    http.read_timeout = 5

    request = Net::HTTP::Post.new(uri.path)
    request["Content-Type"] = "application/json"
    request.body = params.to_json

    response = http.request(request)

    unless response.is_a?(Net::HTTPSuccess)
      Rails.logger.error("[TelegramNotifier] Telegram API error: #{response.code} #{response.body}")
    end

    response
  end

  def self.token
    Rails.application.config.telegram_token
  end

  def self.chat_id
    Rails.application.config.telegram_chat_id
  end

  def self.escape_markdown(text)
    return "" if text.blank?
    # MarkdownV2 requires escaping these characters
    text.to_s.gsub(/([_*\[\]()~`>#+\-=|{}.!\\])/, '\\\\\1')
  end

  private_class_method :send_message, :token, :chat_id, :escape_markdown
end
