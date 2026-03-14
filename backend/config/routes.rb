Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Public endpoints
      resources :services, only: [:index, :show]
      resources :appointments, only: [:create]
      resources :gallery_items, only: [:index]
      get 'available_slots', to: 'available_slots#index'

      # Admin endpoints
      namespace :admin do
        post 'auth/login', to: 'auth#login'
        get 'auth/me', to: 'auth#me'

        get 'dashboard', to: 'dashboard#index'

        resources :services
        resources :appointments, only: [:index, :show, :create, :update, :destroy]
        resources :work_schedules, only: [:index, :update] do
          collection do
            put :bulk_update
          end
        end
        resources :gallery_items, only: [:create, :update, :destroy]
        resources :holidays, only: [:index, :create, :destroy]
      end
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
