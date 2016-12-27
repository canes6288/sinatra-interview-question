require 'sinatra'
require 'json'
require 'pry'

# root
get '/' do
  erb :index, :layout => :main_layout
end

#
get 'favorites' do
  response.header['Content-Type'] = 'application/json'
  File.read('data.json')
end

get '/favorites' do
  binding.pry
  file = JSON.parse(File.read('data.json'))

  unless params[:name] && params[:oid]
    return 'Invalid Request'
  end

  movie = { name: params[:name], oid: params[:oid] }
  file << movie
  File.write('data.json',JSON.pretty_generate(file))
  movie.to_json
end
