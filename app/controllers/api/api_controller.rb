# frozen_string_literal: true

class Api::ApiController < ActionController::Base
  include Response
  include ExceptionHandler

  # Authorization
  include Pundit
  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized
  after_action :verify_authorized, except: [:index]
  after_action :verify_policy_scoped, only: [:index]

  respond_to :json

  # API is protected through Api Key authentication not CSRF
  protect_from_forgery with: :null_session

  before_action :authenticate

  attr_reader :current_user

  def whatsopt_url
    request.base_url + Rails.application.config.relative_url_root.to_s 
  end

  private
    def authenticate
      authenticate_or_request_with_http_token do |token, options|
        @current_user = User.where(api_key: token).first
      end
    end

  private
    def user_not_authenticated
      json_response({ message: "Unauthenticated" }, :unauthorized)
    end

    def user_not_authorized
      json_response({ message: "Unauthorized" }, :unauthorized)
    end
end
