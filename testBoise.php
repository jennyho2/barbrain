<?php
        $api_url = "https://api.omnivore.io/1.0/locations/jcyazEnc/tickets";
        $api_key = "5864a33ba65e4f0390b5994c13b15fe4";

        $postvars = "";
        //$postvars = "dataname=$api_dataname&key=$api_key&token=$api_token";
        //$postvars .= "&table=order_contents&column=id&value_min=128815&value_max=158815&limit=15000&valid_xml=1";
        
        function display_api_response($str)
        {
                //$str = str_replace("<","&lt;",$str);
                //$str = str_replace(">","&gt;",$str);
                //$str = str_replace("\n","<br>",$str);
                //$str = str_replace("\t","&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;",$str);

                $decoded = json_decode($str);
                return $decoded->_embedded{0};
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $api_url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');

        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
          'Api-Key: 5864a33ba65e4f0390b5994c13b15fe4'
        ));
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postvars);

        // while (true)  {
        //   $ch = curl_init();
        //   curl_setopt($ch, CURLOPT_URL, $api_url);
        //   curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        //   curl_setopt($ch, CURLOPT_POST, 1);

        //   curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        //     'Api-Key: 5864a33ba65e4f0390b5994c13b15fe4'
        //   ));
        //   curl_setopt($ch, CURLOPT_POSTFIELDS, $postvars);


        //   // if object has next, go to next & repeat
        // }

        

        //echo "Starting execution";

        $contents = curl_exec($ch);

        //echo "Done executing";

        curl_close ($ch);

        //echo "starting file upload";

       // file_put_contents("latterRows.xml", display_api_response($contents));

        echo "donezo";
        //echo ;
        echo "<br>api response: ";
        var_dump(display_api_response($contents));

  //       $string = display_api_response($contents);

  //         if($xml = simplexml_load_string($string)){
  //   // Keep up to 12MB in memory, if becomes bigger write to temp file
  //   $file = fopen('php://temp/maxmemory:'. (12*1024*1024), 'r+');
  //   if($row = get_object_vars($xml->record[0])){ // First record
  //     // First row contains column header values
  //     foreach($row as $key => $value){
  //       $header[] = $key;
  //     }
  //     fputcsv($file, $header,',','"');
  //     foreach ($xml->record as $record) {
  //       fputcsv($file, get_object_vars($record),',','"');
  //     }
  //     rewind($file);
  //     $output = stream_get_contents($file);
  //     fclose($file);
  //     return $output;
  //   }else{
  //     return '';
  //   }
  // }
?>