<script>

POST: dataname=(anheuser_busch)&key=(pt0iMHVihlZScx2zqxK8)&token=(krOaMsvLH2Y6OIReo0sz)&table=menu_groups
<row>
      <id>8</id>
      <menu_id>11</menu_id>
      <group_name>Dinner</group_name>
      <orderby></orderby>
</row>

</script>

<!DOCTYPE html>
<html>
<body>

<h1>My First Google Map</h1>

<div id="googleMap" style="width:100%;height:400px;"></div>

<script>
function myMap() {
var mapProp= {
    center:new google.maps.LatLng(51.508742,-0.120850),
    zoom:5,
};
var map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
}
</script>

<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&callback=myMap"></script>

</body>
</html>