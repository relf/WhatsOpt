# frozen_string_literal: true

# Load DSL and set up stages
require "capistrano/setup"

# Include default deployment tasks
require "capistrano/deploy"

# Include tasks from other gems included in your Gemfile
require "capistrano/rails"
require "capistrano/rvm"
require "capistrano/bundler"
require "capistrano/rails/assets"
require "capistrano/rails/migrations"
require "capistrano/passenger"
require "capistrano/maintenance"

if ENV["WHATSOPT_INTERNET"]
  require_relative "lib/capistrano/whatsopt_plugin"
  install_plugin Capistrano::WhatsOptPlugin
else
  require "capistrano/scm/git"
  install_plugin Capistrano::SCM::Git
end

# Load custom tasks from `lib/capistrano/tasks` if you have any defined
Dir.glob("lib/capistrano/tasks/*.rake").each { |r| import r }
