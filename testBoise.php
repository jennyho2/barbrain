<?php
        $api_url = "https://api.omnivore.io/1.0/locations/jcyazEnc/tickets";
        $api_key = "5864a33ba65e4f0390b5994c13b15fe4";

        $postvars = "";

        // $ch = curl_init();
        //   curl_setopt($ch, CURLOPT_URL, $api_url);
        //   curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        //   curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');

        //   curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        //     'Api-Key: 5864a33ba65e4f0390b5994c13b15fe4'
        //   ));
        //   //curl_setopt($ch, CURLOPT_POSTFIELDS, $postvars);

        //   $contents = curl_exec($ch);
        //   curl_close ($ch);
        //   $decoded = json_decode($contents);
        //   var_dump($decoded);
        //$postvars = "dataname=$api_dataname&key=$api_key&token=$api_token";
        //$postvars .= "&table=order_contents&column=id&value_min=128815&value_max=158815&limit=15000&valid_xml=1";

        $file = fopen("BoiseData.csv","w");
        while (true)  {
          $newLine = "";
          $ch = curl_init();
          curl_setopt($ch, CURLOPT_URL, $api_url);
          curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
          curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');

          curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Api-Key: 5864a33ba65e4f0390b5994c13b15fe4'
          ));
          //curl_setopt($ch, CURLOPT_POSTFIELDS, $postvars);

          $contents = curl_exec($ch);
          curl_close ($ch);
          $decoded = json_decode($contents);
          if (!property_exists($decoded, "errors")) {
            foreach ($decoded->_embedded->tickets as $line)  {
              $newLine = "";
              //var_dump($line);
              $guest_count = $line->guest_count;
              $closed_at = $line->closed_at;
              $ticket_number = $line->ticket_number;
              
              $employeeName = $line->_embedded->employee->check_name;

              $order_type = $line->_embedded->order_type->name;
              $revenue_center = $line->_embedded->revenue_center->name;

              $totals = $line->totals;
              $paid = $totals->paid;
              $tax = $totals->tax;
              $tips = $totals->tips;
              $total = $totals->total;
              $ticket_items = $line->_embedded->items;
              $newLine .= $guest_count . "," . $closed_at . "," . $ticket_number . "," . $employeeName . "," . $order_type . "," . $revenue_center . "," . $paid . "," . $tax . "," . $tips . "," . $total;
              foreach ($ticket_items as $item)  {
                $itemName = $item->name;
                $itemPrice = $item->price;
                $itemQuantity = $item->quantity;
                $newLine .= "," . $itemName . "," . $itemPrice . "," . $itemQuantity;
              }
              $payments = $line->_embedded->payments;
              foreach ($payments as $payment)  {
                $paymentAmount = $payment->amount;
                $paymentComment = $payment->comment;
                $newLine .= "," . $paymentAmount . "," . $paymentComment;
              }
              fputcsv($file,explode(',',$newLine));
            }
            if (property_exists($decoded->_links, "next"))  {
              $api_url = $decoded->_links->next->href;
            } else {
              break;
            }
          }
        }



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