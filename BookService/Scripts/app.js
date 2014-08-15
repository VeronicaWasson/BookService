var booksApp = angular.module('booksApp', ['ngRoute']);         // The app depends on ngRoute module

// Services to encapsulate RESTful calls.

booksApp.factory('BookService', function ($http, $cacheFactory) {
    var url = '/api/books';
    return {
        getAllBooks: function () {
            return $http.get(url, { cache: true });
        },
        getBook: function (id) {
            return $http.get(url + '/' + id);
        },
        addBook: function (book) {
            // Clear the books cache.
            var cache = $cacheFactory.get('$http');
            cache.remove(url);

            // Then submit the AJAX request.
            return $http.post(url, book);
        }
    };
});

booksApp.factory('AuthorService', function ($http) {
    var url = '/api/authors';
    return {
        getAllAuthors: function () {
            return $http.get(url, { cache: true });
        }
    };
});

// Set global error message if AJAX calls fail
booksApp.factory('httpInterceptor', function ($q, $rootScope) {
    return {
        'request': function (config) {
            $rootScope.error = null;
            return config;
        },

        'responseError': function (rejection) {
            $rootScope.error = rejection.status + ': ' + rejection.statusText;
            return $q.reject(rejection);
        }
    };
});

booksApp.config(function ($httpProvider) {
    $httpProvider.interceptors.push('httpInterceptor');
});

// Configure routes
booksApp.config(function($routeProvider) {
    $routeProvider.when('/books', {
        templateUrl: 'Templates/book-list.html',
        controller: 'BooksController'
    })
    .when('/detail/:id', {
        templateUrl: 'Templates/book-detail.html',
        controller: 'BookDetailController'
    })
    .when('/add-book', {
        templateUrl: 'Templates/add-book.html',
        controller: 'AddBookController'
    })
    .otherwise({
        redirectTo: '/books'
    });
})

// Controllers

booksApp.controller('BooksController', function ($scope, BookService) {
    BookService.getAllBooks().success(function (data) {
        $scope.books = data;
    });
    
});


booksApp.controller('BookDetailController', function ($scope, $routeParams, BookService) {
    BookService.getBook($routeParams.id).success(function (data) {
        $scope.book = data;
    });
});


booksApp.controller('AddBookController', function ($scope, $cacheFactory, BookService, AuthorService) {

    $scope.pending = false;

    // Fetch the list of authors
    AuthorService.getAllAuthors().success(function (data) {
        $scope.authors = data;
        $scope.selectedAuthor = $scope.authors[0];
    });

    $scope.book = { };

    $scope.addBook = function () {
        var book = {
            AuthorId: $scope.selectedAuthor.Id,
            Genre: $scope.book.Genre,
            Price: $scope.book.Price,
            Title: $scope.book.Title,
            Year: $scope.book.Year
        };

        $scope.pending = true;
        BookService.addBook(book).then(function () {
            $scope.pending = false;
        });
    };
});
