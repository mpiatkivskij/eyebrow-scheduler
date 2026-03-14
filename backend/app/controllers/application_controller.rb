class ApplicationController < ActionController::API
  before_action :set_locale

  private

  def set_locale
    lang = request.headers['Accept-Language'].to_s.split(',').first.to_s.strip
    I18n.locale = lang.start_with?('uk') ? :uk : :en
  end

  def authenticate_admin!
    token = request.headers['Authorization']&.split(' ')&.last
    unless token
      render json: { error: 'Unauthorized' }, status: :unauthorized
      return
    end

    begin
      decoded = JWT.decode(token, Rails.application.credentials.secret_key_base, true, algorithm: 'HS256')
      @current_admin = AdminUser.find(decoded[0]['admin_id'])
    rescue JWT::DecodeError, ActiveRecord::RecordNotFound
      render json: { error: 'Invalid token' }, status: :unauthorized
    end
  end

  def current_admin
    @current_admin
  end
end
