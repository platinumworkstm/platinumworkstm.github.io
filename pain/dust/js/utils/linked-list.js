// Quick and dirty implementation of a few lists
// For now just a doubly linked list is created

define( function( require, exports, module ) {

    // Abstract node class that holds whatever data is passed into it
    var node = function( data ) {
        return {
            prev: null,
            next: null,

            data: data
        }
    }

    // double non-circular linked list
    exports.doubleLL = ( function() {
        var start = null,
            end = start;

        var length = 0;

        return {
            push: function( item ) {
                var n = new node( item );

                length = length + 1;

                // If there is no end node then add this node to start and
                if ( !end ) {
                    start = n;
                    end = n;
                // If there is only one item in the list
                } else if ( end === start ) {
                    end = n;
                    start.next = end;
                    end.prev = start;
                // If > 2 items then just add to the end
                } else {
                    n.prev = end;
                    end.next = n;
                    end = n;
                }
            },

            pop: function() {
                if ( length === 0 ) {
                    return null;
                }

                length = length - 1;

                // If there is only one item
                if ( end === start ) {
                    start.next = null;
                    return end.data;
                // Otherwise pop one off the end
                } else {
                    var prev = end.data;
                    end.prev.next = null;
                    end = end.prev;
                    return prev;
                }
            },

            forEach: function( fn ) {
                var iterator = start,
                    count = 0;

                if ( typeof fn !== 'function' ) {
                    throw new Error( 'argument is not a function' );
                }

                while( iterator ) {
                    fn( iterator.data, count );
                    count = count + 1;
                    iterator = iterator.next;
                }
            },

            forEachReverse: function( fn ) {
                var iterator = end,
                    count = length;

                if ( typeof fn !== 'function' ) {
                    throw new Error( 'argument is not a function' );
                }

                while( iterator ) {
                    fn( iterator.data, count );
                    count = count - 1;
                    iterator = iterator.prev;
                }
            }
        }
    })();
});