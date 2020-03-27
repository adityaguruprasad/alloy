/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

export default ({ orgId, hasIdentityCookie }) => {
  return onResponse => {
    return new Promise((resolve, reject) => {
      onResponse(() => {
        if (hasIdentityCookie()) {
          resolve();
        } else {
          // This logic assumes that the code setting the cookie is working as expected and that
          // the cookie was missing from the response.
          const noIdentityCookieError = new Error(
            `An identity was not set properly. Please verify that the org ID ${orgId} configured in Alloy matches the org ID specified in the edge configuration.`
          );
          reject(noIdentityCookieError);
          throw noIdentityCookieError;
        }
      });
    });
  };
};
