module Api
  module V1
    module Admin
      class AuthController < ApplicationController
        def login
          admin = AdminUser.find_by(email: params[:email])
          if admin&.authenticate(params[:password])
            token = JWT.encode(
              { admin_id: admin.id, exp: 24.hours.from_now.to_i },
              Rails.application.credentials.secret_key_base,
              'HS256'
            )
            render json: { token: token, admin: { id: admin.id, email: admin.email } }
          else
            render json: { error: 'Invalid email or password' }, status: :unauthorized
          end
        end

        def me
          authenticate_admin!
          return if performed?
          render json: { admin: { id: current_admin.id, email: current_admin.email } }
        end
      end
    end
  end
end
