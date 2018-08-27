module.exports = function ($app) {

    // http://wix.github.io/angular-tree-control/

    // 加载样式
    require("../views/tree.scss");

    function getPageDimensions() {
        var bttmRight = document.createElement("div");
        bttmRight.setAttribute("style", "visibility:hidden;position:fixed;bottom:0px;right:0px;");
        document.getElementsByTagName("body")[0].appendChild(bttmRight);
        var pageWidth = bttmRight.offsetLeft;
        var pageHeight = bttmRight.offsetTop;
        bttmRight.parentNode.removeChild(bttmRight);
        return {width: pageWidth, height: pageHeight};
    }

    // 菜单
    (function ($app) {
        $app.register.directive('contextMenuId', ['$document', function ($document) {
            return {
                restrict: 'A',
                scope: '@&',
                compile: function compile(tElement, tAttrs, transclude) {
                    return {
                        post: function postLink(scope, iElement, iAttrs, controller) {

                            var ul = angular.element(document.querySelector('#' + iAttrs.contextMenuId));

                            ul.css({'display': 'none'});

                            // right-click on context-menu will show the menu
                            iElement.bind('contextmenu', function showContextMenu(event) {

                                // don't do the normal browser right-click context menu
                                event.preventDefault();

                                // Organise to show off the menu (in roughly the right place)
                                ul.css({
                                    visibility: "hidden",
                                    position: "fixed",
                                    display: "block",
                                    left: event.clientX + 'px',
                                    top: event.clientY + 'px'
                                });

                                var ulDim = {
                                    height: ul.prop("clientHeight"),
                                    width: ul.prop("cientWidth")
                                };

                                var pgDim = getPageDimensions();

                                // will ctxMenu fit on screen (height-wise) ?
                                // TODO: figure out why we need the fudge-factor of 14
                                var ulTop = event.clientY + ulDim.height <= pgDim.height - 14
                                    ? event.clientY
                                    : pgDim.height - ulDim.height - 14;

                                // will ctxMenu fit on screen (width-wise) ?
                                var ulLeft = event.clientX + ulDim.width <= pgDim.width - 2
                                    ? event.clientX
                                    : pgDim.width - ulDim.width - 2;

                                // Ok, now show it off in the right place
                                ul.css({
                                    visibility: "visible",
                                    position: "fixed",
                                    display: "block",
                                    left: ulLeft + 'px',
                                    top: ulTop + 'px'
                                });

                                // setup a one-time click event on the document to hide the dropdown-menu
                                $document.one('click', function hideContextMenu(event) {
                                    ul.css({'display': 'none'});
                                });
                                ul.find("li").one("click", function () {
                                    ul.css({'display': 'none'});
                                })
                            });
                        }
                    };
                }
            };
        }])
            .directive('contextSubmenuId', ['$document', function ($document) {
                return {
                    restrict: 'A',
                    scope: '@&',
                    compile: function compile(tElement, tAttrs, transclude) {
                        return {
                            post: function postLink(scope, iElement, iAttrs, controller) {

                                var ul = angular.element(document.querySelector('#' + iAttrs.contextSubmenuId));

                                ul.css({'display': 'none'});


                                iElement.bind('mouseover', function showSubContextMenu(event) {
                                    // use CSS to move and show the sub dropdown-menu
                                    if (ul.css("display") == 'none') {

                                        // Organise to show off the sub-menu (in roughly the right place)
                                        ul.css({
                                            visibility: "hidden",
                                            position: "fixed",
                                            display: "block",
                                            left: event.clientX + 'px',
                                            top: event.clientY + 'px'
                                        });

                                        var ulDim = {
                                            height: ul.prop("clientHeight"),
                                            width: ul.prop("clientWidth")
                                        };

                                        var pgDim = getPageDimensions();


                                        // Will ctxSubMenu fit (height-wise) ?
                                        // TODO: figure out why we need the fudge-factor of 14
                                        var ulTop = event.clientY + ulDim.height <= pgDim.height - 14
                                            ? event.clientY
                                            : pgDim.height - ulDim.height - 14;

                                        // Will ctxSubMenu fit (on the right of parent menu) ?
                                        var ulLeft =
                                            (event.target.offsetParent.offsetLeft +
                                                event.target.clientWidth + ulDim.width < pgDim.width)
                                                ? event.target.offsetParent.offsetLeft +
                                                event.target.clientWidth

                                                : event.target.offsetParent.offsetLeft - ulDim.width;

                                        // OK, now show it off in the right place
                                        ul.css({
                                            visibility: "visible",
                                            position: "fixed",
                                            display: "block",
                                            left: ulLeft + 'px',
                                            top: ulTop + 'px'
                                        });

                                        // Each uncle/aunt menu item needs a mouseover event to make the subContext menu disappear
                                        angular.forEach(iElement[0].parentElement.parentElement.children, function (child, ndx) {
                                            if (child !== iElement[0].parentElement) {
                                                angular.element(child).one('mouseover', function (event) {
                                                    if (ul.css("display") == 'block') {
                                                        ul.css({
                                                            'display': 'none'
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }

                                    // setup a one-time click event on the document to hide the sub dropdown-menu
                                    $document.one('click', function hideContextMenu(event) {
                                        if (ul.css("display") == 'block') {
                                            ul.css({
                                                'display': 'none'
                                            });
                                        }
                                    });
                                });
                            }
                        };
                    }
                };
            }]);
    })($app);

    // 树
    (function ($app) {
        function createPath(startScope) {
            return function path() {
                var _path = [];
                var scope = startScope;
                var prevNode;
                while (scope && scope.node !== startScope.synteticRoot) {
                    if (prevNode !== scope.node)
                        _path.push(scope.node);
                    prevNode = scope.node;
                    scope = scope.$parent;
                }
                return _path;
            }
        }

        function ensureDefault(obj, prop, value) {
            if (!obj.hasOwnProperty(prop))
                obj[prop] = value;
        }

        function defaultIsLeaf(node, $scope) {
            return !node[$scope.options.nodeChildren] || node[$scope.options.nodeChildren].length === 0;
        }

        function shallowCopy(src, dst) {
            if (angular.isArray(src)) {
                dst = dst || [];

                for (var i = 0; i < src.length; i++) {
                    dst[i] = src[i];
                }
            } else if (angular.isObject(src)) {
                dst = dst || {};

                for (var key in src) {
                    if (hasOwnProperty.call(src, key) && !(key.charAt(0) === '$' && key.charAt(1) === '$')) {
                        dst[key] = src[key];
                    }
                }
            }

            return dst || src;
        }

        function defaultEquality(a, b, $scope) {
            if (!a || !b)
                return false;
            a = shallowCopy(a);
            a[$scope.options.nodeChildren] = [];
            b = shallowCopy(b);
            b[$scope.options.nodeChildren] = [];
            return angular.equals(a, b);
        }

        function defaultIsSelectable() {
            return true;
        }

        function ensureAllDefaultOptions($scope) {
            ensureDefault($scope.options, "multiSelection", false);
            ensureDefault($scope.options, "nodeChildren", "children");
            ensureDefault($scope.options, "dirSelectable", "true");
            ensureDefault($scope.options, "injectClasses", {});
            ensureDefault($scope.options.injectClasses, "ul", "");
            ensureDefault($scope.options.injectClasses, "li", "");
            ensureDefault($scope.options.injectClasses, "liSelected", "");
            ensureDefault($scope.options.injectClasses, "iExpanded", "");
            ensureDefault($scope.options.injectClasses, "iCollapsed", "");
            ensureDefault($scope.options.injectClasses, "iLeaf", "");
            ensureDefault($scope.options.injectClasses, "label", "");
            ensureDefault($scope.options.injectClasses, "labelSelected", "");
            ensureDefault($scope.options, "equality", defaultEquality);
            ensureDefault($scope.options, "isLeaf", defaultIsLeaf);
            ensureDefault($scope.options, "allowDeselect", true);
            ensureDefault($scope.options, "isSelectable", defaultIsSelectable);
        }

        $app.register.directive('ysPlatformTree', ['$compile', function ($compile) {
            /**
             * @param cssClass - the css class
             * @param addClassProperty - should we wrap the class name with class=""
             */
            function classIfDefined(cssClass, addClassProperty) {
                if (cssClass) {
                    if (addClassProperty)
                        return 'class="' + cssClass + '"';
                    else
                        return cssClass;
                }
                else
                    return "";
            }

            return {
                restrict: 'EA',
                require: "ysPlatformTree",
                transclude: true,
                scope: {
                    treeModel: "=",
                    selectedNode: "=?",
                    selectedNodes: "=?",
                    expandedNodes: "=?",
                    onSelection: "&",
                    onNodeToggle: "&",
                    onRightClick: "&",
                    menuId: "@",
                    options: "=?",
                    orderBy: "=?",
                    reverseOrder: "@",
                    filterExpression: "=?",
                    filterComparator: "=?"
                },
                controller: ['$scope', '$element', '$templateCache', '$interpolate', /* 'treeConfig',*/ function ($scope, $element, $templateCache, $interpolate/*, treeConfig*/) {
                    $element.addClass("ys-platform-tree")
                    $scope.options = $scope.options || {};

                    ensureAllDefaultOptions($scope);

                    $scope.selectedNodes = $scope.selectedNodes || [];
                    $scope.expandedNodes = $scope.expandedNodes || [];
                    $scope.expandedNodesMap = {};
                    for (var i = 0; i < $scope.expandedNodes.length; i++) {
                        $scope.expandedNodesMap["a" + i] = $scope.expandedNodes[i];
                    }
                    $scope.parentScopeOfTree = $scope.$parent;


                    function isSelectedNode(node) {
                        if (!$scope.options.multiSelection && ($scope.options.equality(node, $scope.selectedNode, $scope)))
                            return true;
                        else if ($scope.options.multiSelection && $scope.selectedNodes) {
                            for (var i = 0; (i < $scope.selectedNodes.length); i++) {
                                if ($scope.options.equality(node, $scope.selectedNodes[i], $scope)) {
                                    return true;
                                }
                            }
                            return false;
                        }
                    }

                    $scope.headClass = function (node) {
                        var liSelectionClass = classIfDefined($scope.options.injectClasses.liSelected, false);
                        var injectSelectionClass = "";
                        if (liSelectionClass && isSelectedNode(node))
                            injectSelectionClass = " " + liSelectionClass;
                        if ($scope.options.isLeaf(node, $scope))
                            return "tree-leaf" + injectSelectionClass;
                        if ($scope.expandedNodesMap[this.$id])
                            return "tree-expanded" + injectSelectionClass;
                        else
                            return "tree-collapsed" + injectSelectionClass;
                    };

                    $scope.iBranchClass = function () {
                        if ($scope.expandedNodesMap[this.$id])
                            return classIfDefined($scope.options.injectClasses.iExpanded);
                        else
                            return classIfDefined($scope.options.injectClasses.iCollapsed);
                    };

                    $scope.nodeExpanded = function () {
                        return !!$scope.expandedNodesMap[this.$id];
                    };

                    $scope.selectNodeHead = function () {
                        var transcludedScope = this;
                        var expanding = $scope.expandedNodesMap[transcludedScope.$id] === undefined;
                        $scope.expandedNodesMap[transcludedScope.$id] = (expanding ? transcludedScope.node : undefined);
                        if (expanding) {
                            $scope.expandedNodes.push(transcludedScope.node);
                        }
                        else {
                            var index;
                            for (var i = 0; (i < $scope.expandedNodes.length) && !index; i++) {
                                if ($scope.options.equality($scope.expandedNodes[i], transcludedScope.node, $scope)) {
                                    index = i;
                                }
                            }
                            if (index !== undefined)
                                $scope.expandedNodes.splice(index, 1);
                        }
                        if ($scope.onNodeToggle) {
                            var parentNode = (transcludedScope.$parent.node === transcludedScope.synteticRoot) ? null : transcludedScope.$parent.node;
                            var path = createPath(transcludedScope);
                            $scope.onNodeToggle({
                                node: transcludedScope.node,
                                $parentNode: parentNode,
                                $path: path,
                                $index: transcludedScope.$index,
                                $first: transcludedScope.$first,
                                $middle: transcludedScope.$middle,
                                $last: transcludedScope.$last,
                                $odd: transcludedScope.$odd,
                                $even: transcludedScope.$even,
                                expanded: expanding
                            });

                        }
                    };

                    $scope.selectNodeLabel = function (selectedNode) {
                        var transcludedScope = this;
                        if (!$scope.options.isLeaf(selectedNode, $scope) && (!$scope.options.dirSelectable || !$scope.options.isSelectable(selectedNode))) {
                            // Branch node is not selectable, expand
                            this.selectNodeHead();
                        }
                        else if ($scope.options.isLeaf(selectedNode, $scope) && (!$scope.options.isSelectable(selectedNode))) {
                            // Leaf node is not selectable
                            return;
                        }
                        else {
                            var selected = false;
                            if ($scope.options.multiSelection) {
                                var pos = -1;
                                for (var i = 0; i < $scope.selectedNodes.length; i++) {
                                    if ($scope.options.equality(selectedNode, $scope.selectedNodes[i], $scope)) {
                                        pos = i;
                                        break;
                                    }
                                }
                                if (pos === -1) {
                                    $scope.selectedNodes.push(selectedNode);
                                    selected = true;
                                } else {
                                    $scope.selectedNodes.splice(pos, 1);
                                }
                            } else {
                                if (!$scope.options.equality(selectedNode, $scope.selectedNode, $scope)) {
                                    $scope.selectedNode = selectedNode;
                                    selected = true;
                                }
                                else {
                                    if ($scope.options.allowDeselect) {
                                        $scope.selectedNode = undefined;
                                    } else {
                                        $scope.selectedNode = selectedNode;
                                        selected = true;
                                    }
                                }
                            }
                            if ($scope.onSelection) {
                                var parentNode = (transcludedScope.$parent.node === transcludedScope.synteticRoot) ? null : transcludedScope.$parent.node;
                                var path = createPath(transcludedScope)
                                $scope.onSelection({
                                    node: selectedNode,
                                    selected: selected,
                                    $parentNode: parentNode,
                                    $path: path,
                                    $index: transcludedScope.$index,
                                    $first: transcludedScope.$first,
                                    $middle: transcludedScope.$middle,
                                    $last: transcludedScope.$last,
                                    $odd: transcludedScope.$odd,
                                    $even: transcludedScope.$even
                                });
                            }
                        }
                    };

                    $scope.rightClickNodeLabel = function (targetNode, $event) {

                        // Is there a right click function??
                        if ($scope.onRightClick) {

                            // Turn off the browser default context-menu
                            if ($event)
                                $event.preventDefault();

                            // Are are we changing the 'selected' node (as well)?
                            if ($scope.selectedNode != targetNode) {
                                this.selectNodeLabel(targetNode);
                            }

                            // Finally go do what they asked
                            $scope.onRightClick({node: targetNode});
                        }
                    };

                    $scope.selectedClass = function () {
                        var isThisNodeSelected = isSelectedNode(this.node);
                        var labelSelectionClass = classIfDefined($scope.options.injectClasses.labelSelected, false);
                        var injectSelectionClass = "";
                        if (labelSelectionClass && isThisNodeSelected)
                            injectSelectionClass = " " + labelSelectionClass;

                        return isThisNodeSelected ? "tree-selected" + injectSelectionClass : "";
                    };

                    $scope.unselectableClass = function () {
                        var isThisNodeUnselectable = !$scope.options.isSelectable(this.node);
                        var labelUnselectableClass = classIfDefined($scope.options.injectClasses.labelUnselectable, false);
                        return isThisNodeUnselectable ? "tree-unselectable " + labelUnselectableClass : "";
                    };

                    //tree template
                    var rcLabel = $scope.onRightClick ? ' tree-right-click="rightClickNodeLabel(node)"' : '';
                    var ctxMenuId = $scope.menuId ? ' context-menu-id="' + $scope.menuId + '"' : '';

                    $scope.isReverse = function () {
                        return !($scope.reverseOrder === 'false' || $scope.reverseOrder === 'False' || $scope.reverseOrder === '' || $scope.reverseOrder === false);
                    };

                    $scope.orderByFunc = function () {
                        return $scope.orderBy;
                    };

                    var templateOptions = {
                        orderBy: $scope.orderBy ? " | orderBy:orderByFunc():isReverse()" : '',
                        ulClass: classIfDefined($scope.options.injectClasses.ul, true),
                        nodeChildren: $scope.options.nodeChildren,
                        liClass: classIfDefined($scope.options.injectClasses.li, true),
                        iLeafClass: classIfDefined($scope.options.injectClasses.iLeaf, false),
                        labelClass: classIfDefined($scope.options.injectClasses.label, false)
                    };

                    var template;
                    var templateUrl = $scope.options.templateUrl;//|| treeConfig.templateUrl;

                    if (templateUrl) {
                        template = $templateCache.get(templateUrl);
                    }

                    if (!template) {
                        template =
                            '<ul {{options.ulClass}} >' +
                            '   <li ng-repeat="node in node.{{options.nodeChildren}} | filter:filterExpression:filterComparator {{options.orderBy}} track by $index" ng-class="headClass(node)" {{options.liClass}} set-node-to-data>' +
                            '       <div class="title" ng-class="{\'selected\':isSelectedNode(node)}">' +
                            '           <i class="tree-branch-head" ng-class="iBranchClass()" ng-click="selectNodeHead(node)"></i>' +
                            '           <i class="tree-leaf-head {{options.iLeafClass}}"></i>' +
                            '           <div class="tree-label {{options.labelClass}}" ng-class="[selectedClass(), unselectableClass()]" ng-click="selectNodeLabel(node)" ' + rcLabel + ctxMenuId + ' tree-transclude></div>' +
                            '       </div>' +
                            '       <treeitem ng-if="nodeExpanded()"></treeitem>' +
                            '   </li>' +
                            '</ul>';


                    }
                    /*      if (!template) {
                              template =
                                  '<ul {{options.ulClass}} >' +
                                  '   <li ng-repeat="node in node.{{options.nodeChildren}} | filter:filterExpression:filterComparator {{options.orderBy}}" ng-class="headClass(node)" {{options.liClass}} set-node-to-data>' +
                                  '<div class="title" ng-class="{\'selected\':isSelectedNode(node)}"  ng-click="selectNodeLabel(node)" ng-dblclick="dbSelectNodeLabel(node)" ><i class="tree-branch-head" ng-class="iBranchClass()" ng-click="selectNodeHead($event,node)"></i>' +
                                  '<i class="tree-leaf-head {{options.iLeafClass}}"></i>' +
                                  '<div class="tree-label {{options.labelClass}}" ng-class="[selectedClass(), unselectableClass()]" tree-transclude></div></div>' +
                                  '<treeitem ng-if="nodeExpanded()"></treeitem>' +
                                  '</li>' +
                                  '</ul>';
                          }*/

                    this.template = $compile($interpolate(template)({options: templateOptions}));
                }],

                compile: function (element, attrs, childTranscludeFn) {
                    return function (scope, element, attrs, treemodelCntr) {

                        scope.$watch("treeModel", function updateNodeOnRootScope(newValue) {
                            if (angular.isArray(newValue)) {
                                if (angular.isDefined(scope.node) && angular.equals(scope.node[scope.options.nodeChildren], newValue))
                                    return;
                                scope.node = {};
                                scope.synteticRoot = scope.node;
                                scope.node[scope.options.nodeChildren] = newValue;
                            }
                            else {
                                if (angular.equals(scope.node, newValue))
                                    return;
                                scope.node = newValue;
                            }
                        });

                        scope.$watchCollection('expandedNodes', function (newValue, oldValue) {
                            var notFoundIds = 0;
                            var newExpandedNodesMap = {};
                            var $liElements = element.find('li');
                            var existingScopes = [];
                            // find all nodes visible on the tree and the scope $id of the scopes including them
                            angular.forEach($liElements, function (liElement) {
                                var $liElement = angular.element(liElement);
                                var liScope = {
                                    $id: $liElement.data('scope-id'),
                                    node: $liElement.data('node')
                                };
                                existingScopes.push(liScope);
                            });
                            // iterate over the newValue, the new expanded nodes, and for each find it in the existingNodesAndScopes
                            // if found, add the mapping $id -> node into newExpandedNodesMap
                            // if not found, add the mapping num -> node into newExpandedNodesMap
                            angular.forEach(newValue, function (newExNode) {
                                var found = false;
                                for (var i = 0; (i < existingScopes.length) && !found; i++) {
                                    var existingScope = existingScopes[i];
                                    if (scope.options.equality(newExNode, existingScope.node, scope)) {
                                        newExpandedNodesMap[existingScope.$id] = existingScope.node;
                                        found = true;
                                    }
                                }
                                if (!found)
                                    newExpandedNodesMap['a' + notFoundIds++] = newExNode;
                            });
                            scope.expandedNodesMap = newExpandedNodesMap;
                        });

//                        scope.$watch('expandedNodesMap', function(newValue) {
//
//                        });

                        //Rendering template for a root node
                        treemodelCntr.template(scope, function (clone) {
                            element.html('').append(clone);
                        });
                        // save the transclude function from compile (which is not bound to a scope as apposed to the one from link)
                        // we can fix this to work with the link transclude function with angular 1.2.6. as for angular 1.2.0 we need
                        // to keep using the compile function
                        scope.$treeTransclude = childTranscludeFn;
                    };
                }
            };
        }]).directive("setNodeToData", ['$parse', function ($parse) {
            return {
                restrict: 'A',
                link: function ($scope, $element, $attrs) {
                    $element.data('node', $scope.node);
                    $element.data('scope-id', $scope.$id);
                }
            };
        }]).directive('treeRightClick', ["$parse", function ($parse) {
            return function (scope, element, attrs) {
                var fn = $parse(attrs.treeRightClick);
                element.bind('contextmenu', function (event) {
                    scope.$apply(function () {
                        fn(scope, {$event: event});    // go do our stuff
                    });
                });
            };
        }]).directive("treeitem", function () {
            return {
                restrict: 'E',
                require: "^ysPlatformTree",
                link: function (scope, element, attrs, treemodelCntr) {
                    // Rendering template for the current node
                    treemodelCntr.template(scope, function (clone) {
                        element.html('').append(clone);
                    });
                }
            };
        }).directive("treeTransclude", function () {
            return {
                controller: ['$scope', function ($scope) {
                    ensureAllDefaultOptions($scope);
                }],

                link: function (scope, element, attrs, controller) {
                    if (!scope.options.isLeaf(scope.node, scope)) {
                        angular.forEach(scope.expandedNodesMap, function (node, id) {
                            if (scope.options.equality(node, scope.node, scope)) {
                                scope.expandedNodesMap[scope.$id] = scope.node;
                                scope.expandedNodesMap[id] = undefined;
                            }
                        });
                    }
                    if (!scope.options.multiSelection && scope.options.equality(scope.node, scope.selectedNode, scope)) {
                        scope.selectedNode = scope.node;
                    } else if (scope.options.multiSelection) {
                        var newSelectedNodes = [];
                        for (var i = 0; (i < scope.selectedNodes.length); i++) {
                            if (scope.options.equality(scope.node, scope.selectedNodes[i], scope)) {
                                newSelectedNodes.push(scope.node);
                            }
                        }
                        scope.selectedNodes = newSelectedNodes;
                    }

                    // create a scope for the transclusion, whos parent is the parent of the tree control
                    scope.transcludeScope = scope.parentScopeOfTree.$new();
                    scope.transcludeScope.node = scope.node;
                    scope.transcludeScope.$path = createPath(scope);
                    scope.transcludeScope.$parentNode = (scope.$parent.node === scope.synteticRoot) ? null : scope.$parent.node;
                    scope.transcludeScope.$index = scope.$index;
                    scope.transcludeScope.$first = scope.$first;
                    scope.transcludeScope.$middle = scope.$middle;
                    scope.transcludeScope.$last = scope.$last;
                    scope.transcludeScope.$odd = scope.$odd;
                    scope.transcludeScope.$even = scope.$even;
                    scope.$on('$destroy', function () {
                        scope.transcludeScope.$destroy();
                    });

                    scope.$treeTransclude(scope.transcludeScope, function (clone) {
                        element.empty();
                        element.append(clone);
                    });
                }
            };
        });

    })($app)

}