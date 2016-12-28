require 'sinatra'
require 'json'
require 'pry'

# root
get '/' do
  erb :index, :layout => :main_layout
end

#
get '/favorites' do
  response.header['Content-Type'] = 'application/json'
  File.read('data.json')
end

post '/favorites' do
  File.write('data.json', '[]') if File.read('data.json').empty?

  file = JSON.parse(File.read('data.json'))

  unless params[:name] && params[:imdb_id]
    return 'Invalid Request'
  end

  movie = { name: params[:name], imdb_id: params[:imdb_id] }

  file << movie
  File.write('data.json', JSON.pretty_generate(file))
end
