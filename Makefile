all:
	@echo "Lifting the server..."
	@sails lift

install:
	@echo "Creating directories..."
	@node bin/create-dirs.js
	@if [ ! `which sails` ]; then \
		echo "Sails.js not found, installing..."; \
		sudo npm -g install sails@beta; \
	fi
	@if [ ! `which bower` ]; then \
		echo "Bower not found, installing..."; \
		sudo npm -g install bower; \
	fi
	@echo "Installing back-end dependencies..."
	@npm install
	@echo "Installing front-end dependencies..."
	@bower --allow-root install
