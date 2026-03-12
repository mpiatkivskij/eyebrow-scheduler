class ApplicationController < ActionController::API
  private

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
