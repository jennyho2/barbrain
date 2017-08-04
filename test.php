<?php
        $api_url = "https://api.poslavu.com/cp/reqserv/";
        $api_dataname = "cerveza_patago13";
        $api_key = "XCXxRHUsSuF3n3D4s6Lm";
        $api_token = "bsn9GpsHt8UClvnEukGa";

        $postvars = "dataname=$api_dataname&key=$api_key&token=$api_token";
        $postvars .= "&table=menu_groups&limit=15000&valid_xml=1";
        
        function display_api_response($str)
        {
                //$str = str_replace("<","&lt;",$str);
                //$str = str_replace(">","&gt;",$str);
                //$str = str_replace("\n","<br>",$str);
                //$str = str_replace("\t","&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;",$str);
                return $str;
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $api_url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postvars);

        //echo "Starting execution";

        $contents = curl_exec($ch);

        //echo "Done executing";

        curl_close ($ch);

        //echo "starting file upload";

        //var_dump($contents);
        file_put_contents("latterRows.xml", display_api_response($contents));

        echo "donezo";
        //echo ;
        //echo "<br>api response: ";

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