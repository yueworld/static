/*
 * Activiti Modeler component part of the Activiti project
 * Copyright 2005-2014 Alfresco Software, Ltd. All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.

 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */

/*
 * FormKey
 */
var KisBpmFormKeyCtrl = ['$scope', '$modal', "$timeout", function ($scope, $modal, $timeout) {
    var form = angular.extend({}, $scope.property.value);
    if (parent.$app) {
        parent.$app.publish("/workflow/process/form/selected", {formId: form.id}, true).then(function (result) {
            $timeout(function () {
                if (result.execute) {
                    angular.forEach(result.values, function (value) {
                        $scope.property.value = {id: value.id, name: value.name};
                    })
                }
                $scope.property.mode = 'read';
                $scope.updatePropertyInModel($scope.property);
            })
        })
    }
}];